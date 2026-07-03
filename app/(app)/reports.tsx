import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/src/components/AppIcon';
import { BranchSwitcher } from '@/src/components/BranchSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { PeriodSelector } from '@/src/components/PeriodSelector';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { StatCard } from '@/src/components/StatCard';
import { deleteExpense } from '@/src/features/expenses/service';
import { exportReportAsExcel } from '@/src/features/reports/excel';
import { exportReportAsPdf } from '@/src/features/reports/pdf';
import type { ReportDailyTrendRow, ReportData } from '@/src/features/reports/types';
import { deleteRevenue } from '@/src/features/revenue/service';
import { useBranches } from '@/src/hooks/useBranches';
import { useExpensesForRange } from '@/src/hooks/useExpensesForRange';
import { useRevenuesForRange } from '@/src/hooks/useRevenuesForRange';
import { useAuthStore } from '@/src/store/auth';
import { useBranchStore } from '@/src/store/branch';
import { confirmAction } from '@/src/utils/confirmAction';
import { formatAmount } from '@/src/utils/currency';
import { type AnalyticsPeriod, dateRangeForPeriod, PERIOD_LABELS } from '@/src/utils/date';

type DeleteTarget = 'revenues' | 'expenses' | 'all';

const ALL_BRANCHES_LABEL = 'كل الفروع';
const REPORT_TITLE = 'تقرير بيتزا الفرن';

export default function ReportsScreen() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);

  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentUserId = useAuthStore((state) => state.user?.uid ?? '');
  const isOwner = useAuthStore((state) => state.profile?.role === 'owner');
  const { branches } = useBranches();

  const { startDate, endDate } = dateRangeForPeriod(period);
  const { revenues, loading: revenuesLoading } = useRevenuesForRange(startDate, endDate);
  const { expenses, loading: expensesLoading } = useExpensesForRange(startDate, endDate);

  const loading = revenuesLoading || expensesLoading;

  const scopedRevenues =
    selectedBranchId === 'all' ? revenues : revenues.filter((revenue) => revenue.branchId === selectedBranchId);
  const scopedExpenses =
    selectedBranchId === 'all' ? expenses : expenses.filter((expense) => expense.branchId === selectedBranchId);

  const branchNameFor = (branchId: string) => branches.find((branch) => branch.id === branchId)?.name ?? branchId;

  const totalRevenue = scopedRevenues.reduce((sum, revenue) => sum + revenue.total, 0);
  const totalExpense = scopedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpense;
  const averageRevenueEntry = scopedRevenues.length > 0 ? totalRevenue / scopedRevenues.length : 0;
  const averageExpenseEntry = scopedExpenses.length > 0 ? totalExpense / scopedExpenses.length : 0;

  const branchTotals = branches.map((branch) => {
    const totalBranchRevenue = revenues
      .filter((revenue) => revenue.branchId === branch.id)
      .reduce((sum, revenue) => sum + revenue.total, 0);
    const totalBranchExpense = expenses
      .filter((expense) => expense.branchId === branch.id)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      branchName: branch.name,
      totalRevenue: totalBranchRevenue,
      totalExpense: totalBranchExpense,
      netProfit: totalBranchRevenue - totalBranchExpense,
    };
  });

  const trendByDate = new Map<string, ReportDailyTrendRow>();
  for (const revenue of scopedRevenues) {
    const entry = trendByDate.get(revenue.date) ?? {
      date: revenue.date,
      totalRevenue: 0,
      totalExpense: 0,
      netProfit: 0,
    };
    entry.totalRevenue += revenue.total;
    entry.netProfit = entry.totalRevenue - entry.totalExpense;
    trendByDate.set(revenue.date, entry);
  }
  for (const expense of scopedExpenses) {
    const entry = trendByDate.get(expense.date) ?? {
      date: expense.date,
      totalRevenue: 0,
      totalExpense: 0,
      netProfit: 0,
    };
    entry.totalExpense += expense.amount;
    entry.netProfit = entry.totalRevenue - entry.totalExpense;
    trendByDate.set(expense.date, entry);
  }

  const dailyTrend = Array.from(trendByDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  const activeDays = dailyTrend.length;
  const bestRevenueDay = dailyTrend.reduce<ReportDailyTrendRow | undefined>(
    (best, row) => (!best || row.totalRevenue > best.totalRevenue ? row : best),
    undefined
  );
  const highestExpenseDay = dailyTrend.reduce<ReportDailyTrendRow | undefined>(
    (highest, row) => (!highest || row.totalExpense > highest.totalExpense ? row : highest),
    undefined
  );

  const branchLabel =
    selectedBranchId === 'all' ? ALL_BRANCHES_LABEL : (branches.find((branch) => branch.id === selectedBranchId)?.name ?? '');

  const reportData: ReportData = {
    title: REPORT_TITLE,
    periodLabel: PERIOD_LABELS[period],
    startDate,
    endDate,
    branchLabel,
    totalRevenue,
    totalExpense,
    netProfit,
    averageRevenueEntry,
    averageExpenseEntry,
    revenueCount: scopedRevenues.length,
    expenseCount: scopedExpenses.length,
    activeDays,
    bestRevenueDay,
    highestExpenseDay,
    branchTotals: selectedBranchId === 'all' ? branchTotals : [],
    dailyTrend,
    revenueRows: scopedRevenues.map((revenue) => ({
      date: revenue.date,
      branchName: branchNameFor(revenue.branchId),
      amount: revenue.total,
      note: revenue.note,
    })),
    expenseRows: scopedExpenses.map((expense) => ({
      date: expense.date,
      branchName: branchNameFor(expense.branchId),
      amount: expense.amount,
      note: expense.note,
    })),
  };

  const hasData = scopedRevenues.length > 0 || scopedExpenses.length > 0;

  async function handleExport(format: 'pdf' | 'excel') {
    setExporting(format);
    try {
      if (format === 'pdf') {
        await exportReportAsPdf(reportData);
      } else {
        await exportReportAsExcel(reportData);
      }
    } catch (err) {
      Alert.alert('تعذر التصدير', (err as Error).message);
    } finally {
      setExporting(null);
    }
  }

  async function handleDeletePeriodData(target: DeleteTarget) {
    if (!isOwner || deleting) return;

    const revenueTargets = target === 'expenses' ? [] : scopedRevenues;
    const expenseTargets = target === 'revenues' ? [] : scopedExpenses;
    const totalItems = revenueTargets.length + expenseTargets.length;

    if (totalItems === 0) {
      Alert.alert('لا توجد بيانات', 'لا توجد بيانات في الفترة والفرع المحددين للحذف.');
      return;
    }

    const label =
      target === 'revenues' ? 'إيرادات الفترة' : target === 'expenses' ? 'مصروفات الفترة' : 'كل بيانات الفترة';

    confirmAction(
      `حذف ${label}`,
      `سيتم حذف ${revenueTargets.length} إيراد و ${expenseTargets.length} مصروف من الفترة الحالية. لا يمكن التراجع عن هذه العملية.`,
      async () => {
        setDeleting(target);
        try {
          await Promise.all([
            ...revenueTargets.map((revenue) => deleteRevenue(revenue.branchId, revenue.id, currentUserId)),
            ...expenseTargets.map((expense) => deleteExpense(expense.branchId, expense.id, currentUserId)),
          ]);
        } catch (err) {
          Alert.alert('تعذر الحذف', (err as Error).message);
        } finally {
          setDeleting(null);
        }
      }
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <View className="px-5 py-4">
        <Text className="font-cairo-bold text-xl text-text-primary dark:text-text-primary-dark">التقارير</Text>
      </View>

      {loading ? (
        <>
          <BranchSwitcher />
          <PeriodSelector value={period} onChange={setPeriod} />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#D64535" size="large" />
          </View>
        </>
      ) : !hasData ? (
        <>
          <BranchSwitcher />
          <PeriodSelector value={period} onChange={setPeriod} />
          <EmptyState
            title="لا توجد بيانات لهذه الفترة"
            description="سجل دخلًا أو مصروفات لعرض التقرير وتصديره."
          />
        </>
      ) : (
        <ScrollView contentContainerClassName="pb-36 pt-1">
          <BranchSwitcher />
          <PeriodSelector value={period} onChange={setPeriod} />
          <View className="px-5">
            <View className="flex-row-reverse gap-3">
              <StatCard title="الدخل" value={totalRevenue} icon="trending-up" tone="success" />
              <StatCard title="المصروف" value={totalExpense} icon="trending-down" tone="danger" />
            </View>
            <View className="mt-3">
              <StatCard
                title="صافي الربح"
                value={netProfit}
                icon="wallet"
                tone={netProfit >= 0 ? 'success' : 'danger'}
              />
            </View>

            <View className="mt-4 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
              <Text className="mb-3 text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                ملخص الفترة
              </Text>
              <View className="flex-row-reverse flex-wrap gap-2">
                <MetricPill label="عمليات الدخل" value={String(scopedRevenues.length)} />
                <MetricPill label="عمليات المصروفات" value={String(scopedExpenses.length)} />
                <MetricPill label="أيام بها بيانات" value={String(activeDays)} />
                <MetricPill label="متوسط الدخل" value={formatAmount(averageRevenueEntry)} />
                <MetricPill label="متوسط المصروف" value={formatAmount(averageExpenseEntry)} />
                <MetricPill
                  label="أفضل يوم دخل"
                  value={bestRevenueDay ? `${bestRevenueDay.date} | ${formatAmount(bestRevenueDay.totalRevenue)}` : '-'}
                />
              </View>
            </View>

            {dailyTrend.length > 0 ? (
              <View className="mt-4 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                <Text className="mb-3 text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                  اتجاه الدخل والمصروفات
                </Text>
                <TrendBars rows={dailyTrend} />
              </View>
            ) : null}

            {selectedBranchId === 'all' && branchTotals.length > 0 ? (
              <>
                <Text className="mb-3 mt-6 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                  مقارنة الفروع
                </Text>
                {branchTotals.map((branch) => (
                  <View
                    key={branch.branchName}
                    className="mb-2 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
                  >
                    <View className="flex-row-reverse items-center justify-between">
                      <Text className="font-cairo-semibold text-sm text-text-primary dark:text-text-primary-dark">
                        {branch.branchName}
                      </Text>
                      <Text
                        className={`font-cairo-bold text-sm ${
                          branch.netProfit >= 0 ? 'text-success dark:text-success-dark' : 'text-danger dark:text-danger-dark'
                        }`}
                      >
                        {formatAmount(branch.netProfit)}
                      </Text>
                    </View>
                    <View className="mt-3 flex-row-reverse gap-2">
                      <SmallMetric label="الدخل" value={formatAmount(branch.totalRevenue)} tone="success" />
                      <SmallMetric label="المصروف" value={formatAmount(branch.totalExpense)} tone="danger" />
                    </View>
                  </View>
                ))}
              </>
            ) : null}

            {dailyTrend.length > 0 ? (
              <>
                <Text className="mb-3 mt-6 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                  ملخص الأيام
                </Text>
                {dailyTrend.map((row) => (
                  <View
                    key={row.date}
                    className="mb-2 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
                  >
                    <View>
                      <Text className="font-cairo-semibold text-sm text-text-primary dark:text-text-primary-dark">
                        {row.date}
                      </Text>
                      <Text className="mt-1 text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                        دخل {formatAmount(row.totalRevenue)} | مصروف {formatAmount(row.totalExpense)}
                      </Text>
                    </View>
                    <Text
                      className={`font-cairo-bold text-sm ${
                        row.netProfit >= 0 ? 'text-success dark:text-success-dark' : 'text-danger dark:text-danger-dark'
                      }`}
                    >
                      {formatAmount(row.netProfit)}
                    </Text>
                  </View>
                ))}
              </>
            ) : null}

            <View className="mt-8 flex-row-reverse gap-3">
              <View className="flex-1">
                <PrimaryButton
                  label="تصدير PDF"
                  onPress={() => handleExport('pdf')}
                  loading={exporting === 'pdf'}
                  disabled={exporting !== null}
                />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  label="تصدير Excel"
                  onPress={() => handleExport('excel')}
                  loading={exporting === 'excel'}
                  disabled={exporting !== null}
                  variant="secondary"
                />
              </View>
            </View>

            {isOwner ? (
              <View className="mt-6 rounded-2xl border border-danger bg-surface p-4 dark:bg-surface-dark">
                <Text className="text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                  إدارة بيانات الفترة
                </Text>
                <Text className="mt-1 text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                  الحذف يطبق على الفرع والفترة المحددين حاليًا.
                </Text>
                <View className="mt-4 gap-2">
                  <DeleteButton
                    label="حذف إيرادات الفترة"
                    disabled={deleting !== null}
                    loading={deleting === 'revenues'}
                    onPress={() => handleDeletePeriodData('revenues')}
                  />
                  <DeleteButton
                    label="حذف مصروفات الفترة"
                    disabled={deleting !== null}
                    loading={deleting === 'expenses'}
                    onPress={() => handleDeletePeriodData('expenses')}
                  />
                  <DeleteButton
                    label="حذف كل بيانات الفترة"
                    disabled={deleting !== null}
                    loading={deleting === 'all'}
                    onPress={() => handleDeletePeriodData('all')}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function DeleteButton({
  label,
  disabled,
  loading,
  onPress,
}: {
  label: string;
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`min-h-[48px] flex-row-reverse items-center justify-center gap-2 rounded-xl border border-danger px-4 ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      {loading ? <ActivityIndicator color="#A93025" /> : <AppIcon name="trash" size={20} color="#A93025" />}
      <Text className="font-cairo-semibold text-sm text-danger dark:text-danger-dark">{label}</Text>
    </Pressable>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[47%] flex-1 rounded-xl border border-border bg-background px-3 py-2 dark:border-border-dark dark:bg-background-dark">
      <Text className="text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">{label}</Text>
      <Text className="mt-1 text-right font-cairo-bold text-base text-text-primary dark:text-text-primary-dark">
        {value}
      </Text>
    </View>
  );
}

function SmallMetric({ label, value, tone }: { label: string; value: string; tone: 'success' | 'danger' }) {
  return (
    <View className="flex-1 rounded-xl bg-background px-2 py-2 dark:bg-background-dark">
      <Text className="text-center font-cairo text-[11px] text-text-secondary dark:text-text-secondary-dark">
        {label}
      </Text>
      <Text
        className={`mt-1 text-center font-cairo-semibold text-sm ${
          tone === 'success' ? 'text-success dark:text-success-dark' : 'text-danger dark:text-danger-dark'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

function TrendBars({ rows }: { rows: ReportData['dailyTrend'] }) {
  const max = Math.max(...rows.map((row) => Math.max(row.totalRevenue, row.totalExpense)), 1);
  return (
    <View className="gap-3">
      {rows.slice(-10).map((row) => {
        const revenueWidth = row.totalRevenue > 0 ? Math.max(5, Math.round((row.totalRevenue / max) * 100)) : 0;
        const expenseWidth = row.totalExpense > 0 ? Math.max(5, Math.round((row.totalExpense / max) * 100)) : 0;
        return (
          <View key={row.date}>
            <View className="mb-1 flex-row-reverse items-center justify-between">
              <Text className="font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">{row.date}</Text>
              <Text
                className={`font-cairo-semibold text-xs ${
                  row.netProfit >= 0 ? 'text-success dark:text-success-dark' : 'text-danger dark:text-danger-dark'
                }`}
              >
                صافي {formatAmount(row.netProfit)}
              </Text>
            </View>
            <View className="gap-1">
              <View className="h-2 overflow-hidden rounded-full bg-background dark:bg-background-dark">
                <View className="h-2 rounded-full bg-success dark:bg-success-dark" style={{ width: `${revenueWidth}%` }} />
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-background dark:bg-background-dark">
                <View className="h-2 rounded-full bg-danger dark:bg-danger-dark" style={{ width: `${expenseWidth}%` }} />
              </View>
            </View>
          </View>
        );
      })}
      <View className="mt-1 flex-row-reverse gap-3">
        <LegendDot label="دخل" colorClass="bg-success dark:bg-success-dark" />
        <LegendDot label="مصروف" colorClass="bg-danger dark:bg-danger-dark" />
      </View>
    </View>
  );
}

function LegendDot({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <View className="flex-row-reverse items-center gap-1">
      <View className={`h-2 w-2 rounded-full ${colorClass}`} />
      <Text className="font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">{label}</Text>
    </View>
  );
}
