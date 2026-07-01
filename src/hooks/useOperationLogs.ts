import { useEffect, useState } from 'react';

import { subscribeToOperationLogs } from '@/src/features/audit/service';
import type { AuditLog } from '@/src/features/audit/types';

export function useOperationLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToOperationLogs((items) => {
      setLogs(items);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { logs, loading };
}
