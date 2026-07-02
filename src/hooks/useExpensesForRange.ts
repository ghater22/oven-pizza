import { useEffect, useState } from 'react';

import { subscribeToExpenses } from '@/src/features/expenses/service';
import type { Expense } from '@/src/features/expenses/types';

import { useBranches } from './useBranches';

export function useExpensesForRange(startDate: string, endDate: string, enabled = true) {
  const { branches, loading: branchesLoading } = useBranches();
  const [byBranch, setByBranch] = useState<Record<string, Expense[]>>({});

  const branchIds = branches.map((branch) => branch.id).join(',');

  useEffect(() => {
    if (!enabled || branches.length === 0) return;

    const unsubscribes = branches.map((branch) =>
      subscribeToExpenses(branch.id, startDate, endDate, (expenses) => {
        setByBranch((prev) => ({ ...prev, [branch.id]: expenses }));
      })
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchIds, enabled, startDate, endDate]);

  const expenses = branches.flatMap((branch) => byBranch[branch.id] ?? []);

  return { expenses, branches, loading: branchesLoading };
}
