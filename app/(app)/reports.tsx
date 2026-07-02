import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BranchSwitcher } from '@/src/components/BranchSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { PeriodSelector } from '@/src/components/PeriodSelector';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { StatCard } from '@/src/components/StatCard';
import { aggregateExpensesByCategory } from '@/src/features/analytics/expenseBreakdown';
import { aggregateProductPerformance, topByQuantity } from '@/src/features/analytics/productPerformance';
import { exportReportAsExcel } from '@/src/features/reports/excel';
import { exportReportAsPdf } from '@/src/features/reports/pdf';
import type { ReportData } from '@/src/features/reports/types';
import { useBranches } from '@/src/hooks/useBranches';
import { useExpensesForRange } from '@/src/hooks/useExpensesForRange';
import { useProducts } from '@/src/hooks/useProducts';
import { useRevenuesForRange } from '@/src/hooks/useRevenuesForRange';
import { useBranchStore } from '@/src/store/branch';
import { formatAmount } from '@/src/utils/currency';
import { type AnalyticsPeriod, dateRangeForPeriod, PERIOD_LABELS } from '@/src/utils/date';

export default function ReportsScreen() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const { branches } = useBranches();
  const { products } = useProducts();

  const { startDate, endDate } = dateRangeForPeriod(period);
  const { revenues, loading: revenuesLoading } = useRevenuesForRange(startDate, endDate);
  const { expenses, loading: expensesLoading } = useExpensesForRange(startDate, endDate);

  const loading = revenuesLoading || expensesLoading;

  const scopedRevenues =
    selectedBranchId === 'all' ? revenues : revenues.filter((r) => r.branchId === selectedBranchId);
  const scopedExpenses =
    selectedBranchId === 'all' ? expenses : expenses.filter((e) => e.branchId === selectedBranchId);

  const totalRevenue = scopedRevenues.reduce((sum, r) => sum + r.total, 0);
  const totalExpense = scopedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  const branchTotals = branches.map((branch) => ({
    branchName: branch.name,
    totalRevenue: revenues.filter((r) => r.branchId === branch.id).reduce((sum, r) => sum + r.total, 0),
    totalExpense: expenses.filter((e) => e.branchId === branch.id).reduce((sum, e) => sum + e.amount, 0),
    netProfit: 0,
  }));
  for (const branch of branchTotals) {
    branch.netProfit = branch.totalRevenue - branch.totalExpense;
  }

  const expenseBreakdown = aggregateExpensesByCategory(scopedExpenses);
  const topProducts = topByQuantity(aggregateProductPerformance(scopedRevenues, products), 10).map(
    (item) => ({
      productName: item.productName,
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
    })
  );

  const branchLabel =
    selectedBranchId === 'all'
      ? 'كل الفروع'
      : (branches.find((b) => b.id === selectedBranchId)?.name ?? '');

  const reportData: ReportData = {
    title: 'تقرير بيتزا الفرن',
    periodLabel: PERIOD_LABELS[period],
    startDate,
    endDate,
    branchLabel,
    totalRevenue,
    totalExpense,
    netProfit,
    branchTotals: selectedBranchId === 'all' ? branchTotals : [],
    expenseBreakdown,
    topProducts,
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
      Alert.alert('تعذّر التصدير', (err as Error).message);
    } finally {
      setExporting(null);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <View className="px-5 py-4">
        <Text className="font-cairo-bold text-xl text-text-primary dark:text-text-primary-dark">
          التقارير
        </Text>
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
        <EmptyState
          title="لا توجد بيانات لهذه الفترة"
          description="سجّل إيرادات أو مصروفات لعرض التقرير وتصديره."
        />
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

          {expenseBreakdown.length > 0 ? (
            <>
              <Text className="mb-3 mt-6 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                المصروفات حسب التصنيف
              </Text>
              {expenseBreakdown.map((row) => (
                <View
                  key={row.category}
                  className="mb-2 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
                >
                  <Text className="font-cairo-medium text-sm text-text-primary dark:text-text-primary-dark">
                    {row.category}
                  </Text>
                  <Text className="font-cairo-semibold text-sm text-danger dark:text-danger-dark">
                    {formatAmount(row.total)}
                  </Text>
                </View>
              ))}
            </>
          ) : null}

          {topProducts.length > 0 ? (
            <>
              <Text className="mb-3 mt-6 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                أفضل المنتجات
              </Text>
              {topProducts.map((row) => (
                <View
                  key={row.productName}
                  className="mb-2 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
                >
                  <Text className="font-cairo-medium text-sm text-text-primary dark:text-text-primary-dark">
                    {row.productName}
                  </Text>
                  <Text className="font-cairo-semibold text-sm text-success dark:text-success-dark">
                    {formatAmount(row.totalRevenue)}
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
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
