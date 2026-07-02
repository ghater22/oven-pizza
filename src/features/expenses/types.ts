export type ExpenseCategory =
  | 'رواتب'
  | 'إيجار'
  | 'مواد غذائية'
  | 'كهرباء'
  | 'ماء'
  | 'غاز'
  | 'صيانة'
  | 'توصيل'
  | 'تسويق'
  | 'أخرى';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'رواتب',
  'إيجار',
  'مواد غذائية',
  'كهرباء',
  'ماء',
  'غاز',
  'صيانة',
  'توصيل',
  'تسويق',
  'أخرى',
];

export interface Expense {
  id: string;
  branchId: string;
  category: ExpenseCategory;
  amount: number;
  /** YYYY-MM-DD */
  date: string;
  timestamp: Date;
  note?: string;
  createdBy: string;
  receiptName?: string;
  receiptPath?: string;
  receiptUrl?: string;
}
