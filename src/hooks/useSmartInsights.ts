import { collectInsights, type Insight } from '@/src/features/analytics/insights';
import { startOfMonth, startOfWeek, toDateKey } from '@/src/utils/date';

import { useBranches } from './useBranches';
import { useExpensesForRange } from './useExpensesForRange';
import { useProducts } from './useProducts';
import { useRevenuesForRange } from './useRevenuesForRange';

export function useSmartInsights(): { insights: Insight[]; loading: boolean } {
  const now = new Date();
  const todayStr = toDateKey(now);
  const thisWeekStart = toDateKey(startOfWeek(now));

  const lastWeekEnd = new Date(startOfWeek(now));
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const lastWeekStart = new Date(lastWeekEnd);
  lastWeekStart.setDate(lastWeekStart.getDate() - 6);

  const monthStart = toDateKey(startOfMonth(now));

  const { branches, loading: branchesLoading } = useBranches();
  const { products, loading: productsLoading } = useProducts();

  const {
    revenues: thisWeekRevenues,
    revenuesByBranch: thisWeekRevenuesByBranch,
    loading: thisWeekLoading,
  } = useRevenuesForRange(thisWeekStart, todayStr);
  const { revenues: lastWeekRevenues, loading: lastWeekLoading } = useRevenuesForRange(
    toDateKey(lastWeekStart),
    toDateKey(lastWeekEnd)
  );
  const { revenues: monthRevenues, loading: monthLoading } = useRevenuesForRange(monthStart, todayStr);

  const { expenses: thisWeekExpenses, loading: thisWeekExpensesLoading } = useExpensesForRange(
    thisWeekStart,
    todayStr
  );
  const { expenses: lastWeekExpenses, loading: lastWeekExpensesLoading } = useExpensesForRange(
    toDateKey(lastWeekStart),
    toDateKey(lastWeekEnd)
  );

  const loading =
    branchesLoading ||
    productsLoading ||
    thisWeekLoading ||
    lastWeekLoading ||
    monthLoading ||
    thisWeekExpensesLoading ||
    lastWeekExpensesLoading;

  const todayRevenues = thisWeekRevenues.filter((revenue) => revenue.date === todayStr);

  const insights = loading
    ? []
    : collectInsights({
        branches,
        products,
        thisWeekRevenues,
        lastWeekRevenues,
        thisWeekExpenses,
        lastWeekExpenses,
        thisWeekRevenuesByBranch,
        monthRevenues,
        todayRevenues,
      });

  return { insights, loading };
}
