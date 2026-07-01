import type { Expense, ExpenseCategory } from '@/src/features/expenses/types';

export interface ExpenseCategoryTotal {
  category: ExpenseCategory;
  total: number;
}

export function aggregateExpensesByCategory(expenses: Expense[]): ExpenseCategoryTotal[] {
  const totals = new Map<ExpenseCategory, number>();

  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}
