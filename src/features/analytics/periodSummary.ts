import type { Branch } from '@/src/features/branches/types';
import type { Expense } from '@/src/features/expenses/types';
import type { Revenue } from '@/src/features/revenue/types';

export interface BranchTotals {
  branchId: string;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export interface PeriodSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  byBranch: BranchTotals[];
  /** الفرع الأعلى صافي ربح، وليس بالضرورة الأعلى دخلاً — راجع ANALYTICS_MODEL.md */
  bestBranchId: string | null;
}

export function summarizePeriod(
  branches: Branch[],
  revenuesByBranch: Record<string, Revenue[]>,
  expensesByBranch: Record<string, Expense[]>
): PeriodSummary {
  const byBranch: BranchTotals[] = branches.map((branch) => {
    const totalRevenue = (revenuesByBranch[branch.id] ?? []).reduce(
      (sum, revenue) => sum + revenue.total,
      0
    );
    const totalExpense = (expensesByBranch[branch.id] ?? []).reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    return {
      branchId: branch.id,
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
    };
  });

  const totalRevenue = byBranch.reduce((sum, branch) => sum + branch.totalRevenue, 0);
  const totalExpense = byBranch.reduce((sum, branch) => sum + branch.totalExpense, 0);

  const bestBranchId =
    byBranch.length > 0
      ? byBranch.reduce((best, current) => (current.netProfit > best.netProfit ? current : best))
          .branchId
      : null;

  return {
    totalRevenue,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
    byBranch,
    bestBranchId,
  };
}
