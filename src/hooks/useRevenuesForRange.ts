import { useEffect, useState } from 'react';

import { subscribeToRevenues } from '@/src/features/revenue/service';
import type { Revenue } from '@/src/features/revenue/types';

import { useBranches } from './useBranches';

export function useRevenuesForRange(startDate: string, endDate: string) {
  const { branches, loading: branchesLoading } = useBranches();
  const [byBranch, setByBranch] = useState<Record<string, Revenue[]>>({});

  const branchIds = branches.map((branch) => branch.id).join(',');

  useEffect(() => {
    if (branches.length === 0) return;

    const unsubscribes = branches.map((branch) =>
      subscribeToRevenues(branch.id, startDate, endDate, (revenues) => {
        setByBranch((prev) => ({ ...prev, [branch.id]: revenues }));
      })
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchIds, startDate, endDate]);

  const revenues = branches.flatMap((branch) => byBranch[branch.id] ?? []);

  return { revenues, revenuesByBranch: byBranch, branches, loading: branchesLoading };
}
