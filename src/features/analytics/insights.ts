import type { Branch } from '@/src/features/branches/types';
import { EXPENSE_CATEGORIES, type Expense } from '@/src/features/expenses/types';
import type { Product } from '@/src/features/products/types';
import type { Revenue } from '@/src/features/revenue/types';

import {
  aggregateProductPerformance,
  aggregateProductPerformanceByBranch,
  topByQuantity,
} from './productPerformance';
import { aggregateByHour, formatHourLabel, peakHours } from './timePerformance';

export type InsightTone = 'warning' | 'positive' | 'info';

export interface Insight {
  id: string;
  tone: InsightTone;
  message: string;
}

const TONE_PRIORITY: Record<InsightTone, number> = { warning: 0, positive: 1, info: 2 };

export function compareTotals(
  current: number,
  previous: number
): { diff: number; percentChange: number; direction: 'up' | 'down' | 'flat' } {
  const diff = current - previous;
  if (previous === 0) {
    return { diff, percentChange: current > 0 ? 100 : 0, direction: diff > 0 ? 'up' : 'flat' };
  }
  const percentChange = (diff / previous) * 100;
  return { diff, percentChange, direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat' };
}

export function weeklyRevenueInsight(thisWeekTotal: number, lastWeekTotal: number): Insight | null {
  const { percentChange, direction } = compareTotals(thisWeekTotal, lastWeekTotal);
  if (direction === 'flat' || Math.abs(percentChange) < 10) return null;

  const rounded = Math.round(Math.abs(percentChange));
  return direction === 'up'
    ? { id: 'weekly-revenue-up', tone: 'positive', message: `المبيعات ارتفعت ${rounded}% مقارنة بالأسبوع الماضي` }
    : { id: 'weekly-revenue-down', tone: 'warning', message: `المبيعات انخفضت ${rounded}% مقارنة بالأسبوع الماضي` };
}

export function expenseCategoryInsights(
  thisWeekExpenses: Expense[],
  lastWeekExpenses: Expense[]
): Insight[] {
  const insights: Insight[] = [];

  for (const category of EXPENSE_CATEGORIES) {
    const current = thisWeekExpenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const previous = lastWeekExpenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);

    if (previous <= 0) continue;

    const { percentChange } = compareTotals(current, previous);
    if (percentChange > 20) {
      insights.push({
        id: `expense-${category}`,
        tone: 'warning',
        message: `ارتفعت مصروفات ${category} هذا الأسبوع بنسبة ${Math.round(percentChange)}%`,
      });
    }
  }

  return insights;
}

export function branchEveningInsight(branches: Branch[], revenuesToday: Revenue[]): Insight | null {
  if (branches.length < 2) return null;

  const evening = revenuesToday.filter((revenue) => revenue.timestamp.getHours() >= 17);
  const totals = branches
    .map((branch) => ({
      branch,
      total: evening.filter((revenue) => revenue.branchId === branch.id).reduce((sum, r) => sum + r.total, 0),
    }))
    .sort((a, b) => b.total - a.total);

  const [first, second] = totals;
  if (!first || !second || first.total === 0) return null;

  const { percentChange } = compareTotals(first.total, second.total);
  if (percentChange > 20) {
    return { id: 'branch-evening', tone: 'info', message: `${first.branch.name} يحقق مبيعات أعلى مساءً` };
  }
  return null;
}

export function weakProductInsight(
  branches: Branch[],
  revenuesByBranch: Record<string, Revenue[]>,
  products: Product[]
): Insight | null {
  if (branches.length < 2) return null;

  const performanceByBranch = aggregateProductPerformanceByBranch(revenuesByBranch, products);

  for (const product of products) {
    const entries = branches
      .map((branch) => ({
        branch,
        item: performanceByBranch[branch.id]?.find((entry) => entry.productId === product.id),
      }))
      .filter((entry): entry is { branch: Branch; item: NonNullable<typeof entry.item> } =>
        Boolean(entry.item)
      );

    if (entries.length < 2) continue;

    const totalQuantity = entries.reduce((sum, entry) => sum + entry.item.totalQuantity, 0);
    if (totalQuantity === 0) continue;

    const shares = entries.map((entry) => ({
      branch: entry.branch,
      share: entry.item.totalQuantity / totalQuantity,
    }));
    const weakest = shares.reduce((min, current) => (current.share < min.share ? current : min));
    const strongest = shares.reduce((max, current) => (current.share > max.share ? current : max));

    if (weakest.branch.id !== strongest.branch.id && weakest.share < 0.2 && strongest.share > 0.6) {
      return {
        id: `weak-product-${product.id}`,
        tone: 'warning',
        message: `${product.name} ضعيف في ${weakest.branch.name}`,
      };
    }
  }

  return null;
}

export function bestProductOfMonthInsight(monthlyRevenues: Revenue[], products: Product[]): Insight | null {
  const performance = aggregateProductPerformance(monthlyRevenues, products);
  const [top] = topByQuantity(performance, 1);
  if (!top) return null;

  return { id: 'best-product-month', tone: 'positive', message: `أفضل منتج هذا الشهر هو ${top.productName}` };
}

export function dailyPeakInsight(todayRevenues: Revenue[]): Insight | null {
  const total = todayRevenues.reduce((sum, revenue) => sum + revenue.total, 0);
  if (total === 0) return null;

  const [top] = peakHours(aggregateByHour(todayRevenues), 1);
  if (!top) return null;

  const share = top.total / total;
  if (share > 0.25) {
    return {
      id: 'daily-peak',
      tone: 'info',
      message: `ذروة اليوم بين الساعة ${formatHourLabel(top.hour)} و${formatHourLabel((top.hour + 1) % 24)}`,
    };
  }
  return null;
}

export interface CollectInsightsInput {
  branches: Branch[];
  products: Product[];
  thisWeekRevenues: Revenue[];
  lastWeekRevenues: Revenue[];
  thisWeekExpenses: Expense[];
  lastWeekExpenses: Expense[];
  thisWeekRevenuesByBranch: Record<string, Revenue[]>;
  monthRevenues: Revenue[];
  todayRevenues: Revenue[];
}

export function collectInsights(input: CollectInsightsInput): Insight[] {
  const thisWeekTotal = input.thisWeekRevenues.reduce((sum, r) => sum + r.total, 0);
  const lastWeekTotal = input.lastWeekRevenues.reduce((sum, r) => sum + r.total, 0);

  const all = [
    weeklyRevenueInsight(thisWeekTotal, lastWeekTotal),
    ...expenseCategoryInsights(input.thisWeekExpenses, input.lastWeekExpenses),
    branchEveningInsight(input.branches, input.todayRevenues),
    weakProductInsight(input.branches, input.thisWeekRevenuesByBranch, input.products),
    bestProductOfMonthInsight(input.monthRevenues, input.products),
    dailyPeakInsight(input.todayRevenues),
  ].filter((insight): insight is Insight => insight !== null);

  return all.sort((a, b) => TONE_PRIORITY[a.tone] - TONE_PRIORITY[b.tone]).slice(0, 5);
}
