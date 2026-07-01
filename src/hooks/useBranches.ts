import { useEffect, useState } from 'react';

import { subscribeToBranches } from '@/src/features/branches/service';
import type { Branch } from '@/src/features/branches/types';

export function useBranches(): { branches: Branch[]; loading: boolean } {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToBranches((next) => {
      setBranches(next);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { branches, loading };
}
