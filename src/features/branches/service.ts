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

export async function createBranch(name: string, order: number): Promise<void> {
  await addDoc(collection(getFirestoreDb(), COLLECTION), {
    name,
    order,
    active: true,
    createdAt: new Date(),
  });
}

export async function renameBranch(branchId: string, name: string): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), COLLECTION, branchId), { name });
}

export async function deleteBranch(branchId: string): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), COLLECTION, branchId), { active: false });
}
