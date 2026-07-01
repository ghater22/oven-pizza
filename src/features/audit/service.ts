import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';

import { getFirestoreDb } from '@/src/firebase/config';

import type { AuditAction, AuditEntity, AuditLog } from './types';

const COLLECTION = 'operationLogs';

export async function logOperation(input: {
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  label: string;
  branchId?: string | null;
  userId: string;
}): Promise<void> {
  if (!input.userId) return;

  await addDoc(collection(getFirestoreDb(), COLLECTION), {
    ...input,
    branchId: input.branchId ?? null,
    createdAt: Timestamp.now(),
  });
}

export function subscribeToOperationLogs(callback: (logs: AuditLog[]) => void): () => void {
  const q = query(collection(getFirestoreDb(), COLLECTION), orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          label: data.label,
          branchId: data.branchId,
          userId: data.userId,
          createdAt: (data.createdAt as Timestamp).toDate(),
        } satisfies AuditLog;
      })
    );
  });
}
