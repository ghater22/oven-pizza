import { useEffect, useState } from 'react';

import { subscribeToBranches } from '@/src/features/branches/service';
import type { Branch } from '@/src/features/branches/types';
import { useAuthStore } from '@/src/store/auth';

export function useBranches(): { branches: Branch[]; loading: boolean } {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const profile = useAuthStore((state) => state.profile);

  useEffect(() => {
    const unsubscribe = subscribeToBranches((next) => {
      const allowedBranchIds = profile?.role === 'accountant' ? (profile.branchIds ?? []) : null;
      setBranches(
        allowedBranchIds
          ? next.filter((branch) => allowedBranchIds.includes(branch.id))
          : next
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [profile?.branchIds, profile?.role]);

  return { branches, loading };
}
