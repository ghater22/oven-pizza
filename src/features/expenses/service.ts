import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

import { getFirestoreDb } from '@/src/firebase/config';

import type { Expense } from './types';

function expensesCollection(branchId: string) {
  return collection(getFirestoreDb(), 'branches', branchId, 'expenses');
}

/** يشترك في مصروفات فرع واحد ضمن مدى تاريخ (شامل الطرفين، صيغة YYYY-MM-DD). */
export function subscribeToExpenses(
  branchId: string,
  startDate: string,
  endDate: string,
  callback: (expenses: Expense[]) => void
): () => void {
  const q = query(
    expensesCollection(branchId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        branchId,
        category: data.category,
        amount: data.amount,
        date: data.date,
        timestamp: (data.timestamp as Timestamp).toDate(),
        note: data.note,
        createdBy: data.createdBy,
      } satisfies Expense;
    });
    callback(expenses);
  });
}
