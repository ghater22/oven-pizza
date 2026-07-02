import { doc, setDoc } from 'firebase/firestore';

import { logOperation } from '@/src/features/audit/service';
import type { UserRole } from '@/src/features/auth/types';
import { getFirestoreDb } from '@/src/firebase/config';

const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

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
