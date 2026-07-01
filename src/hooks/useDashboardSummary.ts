import { useEffect, useState } from 'react';

import { summarizePeriod } from '@/src/features/analytics/periodSummary';
import type { Expense } from '@/src/features/expenses/types';
import { subscribeToExpenses } from '@/src/features/expenses/service';
import { subscribeToRevenues } from '@/src/features/revenue/service';
import type { Revenue } from '@/src/features/revenue/types';
import { todayKey } from '@/src/utils/date';

import { useBranches } from './useBranches';

export function useDashboardSummary() {
  const { branches, loading: branchesLoading } = useBranches();
  const [revenuesByBranch, setRevenuesByBranch] = useState<Record<string, Revenue[]>>({});
  const [expensesByBranch, setExpensesByBranch] = useState<Record<string, Expense[]>>({});

  const branchIds = branches.map((branch) => branch.id).join(',');

  useEffect(() => {
    if (branches.length === 0) return;

    const today = todayKey();
    const unsubscribes = branches.flatMap((branch) => [
      subscribeToRevenues(branch.id, today, today, (revenues) => {
        setRevenuesByBranch((prev) => ({ ...prev, [branch.id]: revenues }));
      }),
      subscribeToExpenses(branch.id, today, today, (expenses) => {
        setExpensesByBranch((prev) => ({ ...prev, [branch.id]: expenses }));
      }),
    ]);

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchIds]);

  const summary = summarizePeriod(branches, revenuesByBranch, expensesByBranch);
  const revenues = branches.flatMap((branch) => revenuesByBranch[branch.id] ?? []);
  const expenses = branches.flatMap((branch) => expensesByBranch[branch.id] ?? []);

  return { branches, summary, revenues, expenses, loading: branchesLoading };
}
