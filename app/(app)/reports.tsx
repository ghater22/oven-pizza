import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/src/components/AppIcon';
import { BranchSwitcher } from '@/src/components/BranchSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { PeriodSelector } from '@/src/components/PeriodSelector';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { StatCard } from '@/src/components/StatCard';
import { aggregateExpensesByCategory } from '@/src/features/analytics/expenseBreakdown';
import { aggregateProductPerformance, topByQuantity } from '@/src/features/analytics/productPerformance';
import { deleteExpense } from '@/src/features/expenses/service';
import { exportReportAsExcel } from '@/src/features/reports/excel';
import { exportReportAsPdf } from '@/src/features/reports/pdf';
import type { ReportData } from '@/src/features/reports/types';
import { deleteRevenue } from '@/src/features/revenue/service';
import { useBranches } from '@/src/hooks/useBranches';
import { useExpensesForRange } from '@/src/hooks/useExpensesForRange';
import { useProducts } from '@/src/hooks/useProducts';
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
  const { products } = useProducts();

  const { startDate, endDate } = dateRangeForPeriod(period);
  const { revenues, loading: revenuesLoading } = useRevenuesForRange(startDate, endDate);
  const { expenses, loading: expensesLoading } = useExpensesForRange(startDate, endDate);

  const loading = revenuesLoading || expensesLoading;

  const scopedRevenues =
    selectedBranchId === 'all' ? revenues : revenues.filter((r) => r.branchId === selectedBranchId);
  const scopedExpenses =
    selectedBranchId === 'all' ? expenses : expenses.filter((e) => e.branchId === selectedBranchId);

  const branchNameFor = (branchId: string) => branches.find((branch) => branch.id === branchId)?.name ?? branchId;

  const totalRevenue = scopedRevenues.reduce((sum, r) => sum + r.total, 0);
  const totalExpense = scopedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  const branchTotals = branches.map((branch) => {
    const totalBranchRevenue = revenues
      .filter((r) => r.branchId === branch.id)
      .reduce((sum, r) => sum + r.total, 0);
    const totalBranchExpense = expenses
      .filter((e) => e.branchId === branch.id)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      branchName: branch.name,
      totalRevenue: totalBranchRevenue,
      totalExpense: totalBranchExpense,
      netProfit: totalBranchRevenue - totalBranchExpense,
    };
  });

  const expenseBreakdown = aggregateExpensesByCategory(scopedExpenses);
  const topProducts = topByQuantity(aggregateProductPerformance(scopedRevenues, products), 10).map((item) => ({
    productName: item.productName,
    totalQuantity: item.totalQuantity,
    totalRevenue: item.totalRevenue,
  }));

  const branchLabel =
    selectedBranchId === 'all' ? ALL_BRANCHES_LABEL : (branches.find((b) => b.id === selectedBranchId)?.name ?? '');

  const reportData: ReportData = {
    title: REPORT_TITLE,
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
    revenueRows: scopedRevenues.map((revenue) => ({
      date: revenue.date,
      branchName: branchNameFor(revenue.branchId),
      productName: revenue.productName,
      quantity: revenue.quantity,
      unitPrice: revenue.unitPrice,
      total: revenue.total,
    })),
    expenseRows: scopedExpenses.map((expense) => ({
      date: expense.date,
      branchName: branchNameFor(expense.branchId),
      category: expense.category,
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
            description="سجل إيرادات أو مصروفات لعرض التقرير وتصديره."
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

            {isOwner ? (
              <View className="mt-6 rounded-2xl border border-danger bg-surface p-4 dark:bg-surface-dark">
                <Text className="text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                  إدارة بيانات الفترة
                </Text>
                <Text className="mt-1 text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                  الحذف يطبق على الفرع والفترة المحددين حالياً.
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
