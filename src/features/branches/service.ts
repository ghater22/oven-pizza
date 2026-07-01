import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import { getFirestoreDb } from '@/src/firebase/config';
import { logOperation } from '@/src/features/audit/service';

import type { Branch } from './types';

const COLLECTION = 'branches';

export function subscribeToBranches(callback: (branches: Branch[]) => void): () => void {
  const q = query(collection(getFirestoreDb(), COLLECTION), orderBy('order', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const branches = snapshot.docs
      .map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<Branch, 'id'>),
      }))
      .filter((branch) => branch.active !== false);
    callback(branches);
  });
}

export async function createBranch(name: string, order: number, userId = ''): Promise<void> {
  const docRef = await addDoc(collection(getFirestoreDb(), COLLECTION), {
    name,
    order,
    active: true,
    createdAt: new Date(),
  });
  await logOperation({ action: 'create', entity: 'branch', entityId: docRef.id, label: name, userId });
}

export async function renameBranch(branchId: string, name: string, userId = ''): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), COLLECTION, branchId), { name });
  await logOperation({ action: 'update', entity: 'branch', entityId: branchId, label: name, userId });
}

export async function deleteBranch(branchId: string, name = 'فرع', userId = ''): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), COLLECTION, branchId), { active: false });
  await logOperation({ action: 'delete', entity: 'branch', entityId: branchId, label: name, userId });
}
