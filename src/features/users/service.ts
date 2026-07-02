import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

import { logOperation } from '@/src/features/audit/service';
import type { AppUserProfile, UserRole } from '@/src/features/auth/types';
import { getFirestoreDb } from '@/src/firebase/config';

const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

export interface ManagedUser extends AppUserProfile {
  createdAt?: Date;
  createdBy?: string;
}

export function subscribeToManagedUsers(callback: (users: ManagedUser[]) => void): () => void {
  return onSnapshot(collection(getFirestoreDb(), 'users'), (snapshot) => {
    const users = snapshot.docs
      .map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          uid: docSnapshot.id,
          email: data.email ?? null,
          displayName: data.displayName ?? null,
          role: (data.role as UserRole) ?? 'accountant',
          branchIds: Array.isArray(data.branchIds) ? (data.branchIds as string[]) : [],
          createdAt: data.createdAt?.toDate?.() ?? undefined,
          createdBy: data.createdBy,
        } satisfies ManagedUser;
      })
      .sort((a, b) => (a.displayName ?? a.email ?? '').localeCompare(b.displayName ?? b.email ?? ''));

    callback(users);
  });
}

export async function createManagedUser(input: {
  email: string;
  password: string;
  role: UserRole;
  branchIds?: string[];
  displayName: string;
  createdBy: string;
}): Promise<void> {
  if (!API_KEY) {
    throw new Error('Firebase API key غير متاح.');
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      returnSecureToken: false,
    }),
  });

  const data = (await response.json()) as { localId?: string; error?: { message?: string } };

  if (!response.ok || !data.localId) {
    throw new Error(data.error?.message ?? 'تعذر إنشاء المستخدم.');
  }

  await setDoc(doc(getFirestoreDb(), 'users', data.localId), {
    email: input.email,
    displayName: input.displayName,
    role: input.role,
    branchIds: input.role === 'accountant' ? (input.branchIds ?? []) : [],
    createdAt: new Date(),
    createdBy: input.createdBy,
  });

  await logOperation({
    action: 'create',
    entity: 'user',
    entityId: data.localId,
    label: input.email,
    userId: input.createdBy,
  });
}

export async function updateManagedUser(input: {
  uid: string;
  displayName: string;
  role: UserRole;
  branchIds?: string[];
  updatedBy: string;
}): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), 'users', input.uid), {
    displayName: input.displayName,
    role: input.role,
    branchIds: input.role === 'accountant' ? (input.branchIds ?? []) : [],
    updatedAt: new Date(),
    updatedBy: input.updatedBy,
  });

  await logOperation({
    action: 'update',
    entity: 'user',
    entityId: input.uid,
    label: input.displayName,
    userId: input.updatedBy,
  });
}

export async function deleteManagedUser(uid: string, label: string, deletedBy: string): Promise<void> {
  await deleteDoc(doc(getFirestoreDb(), 'users', uid));

  await logOperation({
    action: 'delete',
    entity: 'user',
    entityId: uid,
    label,
    userId: deletedBy,
  });
}
