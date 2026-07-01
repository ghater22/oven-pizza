import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { getFirestoreDb } from '@/src/firebase/config';
import { toDateKey } from '@/src/utils/date';

import type { Revenue } from './types';

function revenuesCollection(branchId: string) {
  return collection(getFirestoreDb(), 'branches', branchId, 'revenues');
}

/** يشترك في إيرادات فرع واحد ضمن مدى تاريخ (شامل الطرفين، صيغة YYYY-MM-DD). */
export function subscribeToRevenues(
  branchId: string,
  startDate: string,
  endDate: string,
  callback: (revenues: Revenue[]) => void
): () => void {
  const q = query(
    revenuesCollection(branchId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const revenues = snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        branchId,
        productId: data.productId,
        productName: data.productName,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        total: data.total,
        date: data.date,
        timestamp: (data.timestamp as Timestamp).toDate(),
        note: data.note,
        createdBy: data.createdBy,
      } satisfies Revenue;
    });
    callback(revenues);
  });
}

export interface RevenueInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  timestamp: Date;
  note?: string;
  createdBy: string;
}

export async function createRevenue(branchId: string, input: RevenueInput): Promise<void> {
  await addDoc(revenuesCollection(branchId), {
    productId: input.productId,
    productName: input.productName,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    total: input.quantity * input.unitPrice,
    date: toDateKey(input.timestamp),
    timestamp: Timestamp.fromDate(input.timestamp),
    note: input.note ?? null,
    createdBy: input.createdBy,
    createdAt: Timestamp.now(),
  });
}

export async function updateRevenue(
  branchId: string,
  revenueId: string,
  input: Omit<RevenueInput, 'createdBy'>
): Promise<void> {
  await updateDoc(doc(revenuesCollection(branchId), revenueId), {
    productId: input.productId,
    productName: input.productName,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    total: input.quantity * input.unitPrice,
    date: toDateKey(input.timestamp),
    timestamp: Timestamp.fromDate(input.timestamp),
    note: input.note ?? null,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteRevenue(branchId: string, revenueId: string): Promise<void> {
  await deleteDoc(doc(revenuesCollection(branchId), revenueId));
}
