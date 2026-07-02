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
import { isAccountingDateClosed } from '@/src/utils/monthlyClose';
import { logOperation } from '@/src/features/audit/service';

import type { Expense, ExpenseCategory } from './types';

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
        receiptName: data.receiptName,
        receiptPath: data.receiptPath,
        receiptUrl: data.receiptUrl,
      } satisfies Expense;
    });
    callback(expenses);
  });
}

export interface ExpenseInput {
  category: ExpenseCategory;
  amount: number;
  timestamp: Date;
  note?: string;
  createdBy: string;
  receiptName?: string;
  receiptPath?: string;
  receiptUrl?: string;
}

export async function createExpense(branchId: string, input: ExpenseInput): Promise<void> {
  if (isAccountingDateClosed(input.timestamp)) {
    throw new Error('هذا الشهر مقفل محاسبيًا ولا يمكن إضافة عمليات له');
  }

  const docRef = await addDoc(expensesCollection(branchId), {
    category: input.category,
    amount: input.amount,
    date: toDateKey(input.timestamp),
    timestamp: Timestamp.fromDate(input.timestamp),
    note: input.note ?? null,
    receiptName: input.receiptName ?? null,
    receiptPath: input.receiptPath ?? null,
    receiptUrl: input.receiptUrl ?? null,
    createdBy: input.createdBy,
    createdAt: Timestamp.now(),
  });
  await logOperation({
    action: 'create',
    entity: 'expense',
    entityId: docRef.id,
    label: input.category,
    branchId,
    userId: input.createdBy,
  });
}

export async function updateExpense(
  branchId: string,
  expenseId: string,
  input: Omit<ExpenseInput, 'createdBy'>
): Promise<void> {
  if (isAccountingDateClosed(input.timestamp)) {
    throw new Error('هذا الشهر مقفل محاسبيًا ولا يمكن تعديل عملياته');
  }

  await updateDoc(doc(expensesCollection(branchId), expenseId), {
    category: input.category,
    amount: input.amount,
    date: toDateKey(input.timestamp),
    timestamp: Timestamp.fromDate(input.timestamp),
    note: input.note ?? null,
    receiptName: input.receiptName ?? null,
    receiptPath: input.receiptPath ?? null,
    receiptUrl: input.receiptUrl ?? null,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteExpense(branchId: string, expenseId: string, userId = ''): Promise<void> {
  await deleteDoc(doc(expensesCollection(branchId), expenseId));
  await logOperation({
    action: 'delete',
    entity: 'expense',
    entityId: expenseId,
    label: 'مصروف',
    branchId,
    userId,
  });
}
