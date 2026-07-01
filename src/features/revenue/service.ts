import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

import { getFirestoreDb } from '@/src/firebase/config';

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
