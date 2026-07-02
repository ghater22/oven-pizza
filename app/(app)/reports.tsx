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
type ReportProductKind = 'pizza' | 'drink' | 'sauce' | 'other';

const ALL_BRANCHES_LABEL = 'كل الفروع';
const REPORT_TITLE = 'تقرير بيتزا الفرن';
const PRODUCT_KIND_LABELS: Record<ReportProductKind, string> = {
  pizza: 'البيتزا',
  drink: 'المشروبات',
  sauce: 'الصوصات',
  other: 'أخرى',
};

function classifyProductKind(productName: string, productCategory?: string): ReportProductKind {
  const value = `${productName} ${productCategory ?? ''}`.toLowerCase();
  if (value.includes('صوص') || value.includes('sauce')) return 'sauce';
  if (
    value.includes('مشروب') ||
    value.includes('مشروبات') ||
    value.includes('غازي') ||
    value.includes('بيبسي') ||
    value.includes('كولا') ||
    value.includes('ماء') ||
    value.includes('drink')
  ) {
    return 'drink';
  }
  if (value.includes('بيتزا') || value.includes('ببتزا') || value.includes('pizza')) return 'pizza';
  return 'other';
}

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
  const totalSoldQuantity = scopedRevenues.reduce((sum, revenue) => sum + revenue.quantity, 0);
  const averageRevenueTicket = scopedRevenues.length > 0 ? totalRevenue / scopedRevenues.length : 0;

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
  const productCategoryBuckets: Record<ReportProductKind, { totalQuantity: number; totalRevenue: number }> = {
    pizza: { totalQuantity: 0, totalRevenue: 0 },
    drink: { totalQuantity: 0, totalRevenue: 0 },
    sauce: { totalQuantity: 0, totalRevenue: 0 },
    other: { totalQuantity: 0, totalRevenue: 0 },
  };
  for (const revenue of scopedRevenues) {
    const product = products.find((item) => item.id === revenue.productId);
    const kind = classifyProductKind(revenue.productName, product?.category);
    productCategoryBuckets[kind].totalQuantity += revenue.quantity;
    productCategoryBuckets[kind].totalRevenue += revenue.total;
  }
  const productCategoryTotals = (Object.keys(productCategoryBuckets) as ReportProductKind[]).map((kind) => ({
    category: PRODUCT_KIND_LABELS[kind],
    totalQuantity: productCategoryBuckets[kind].totalQuantity,
    totalRevenue: productCategoryBuckets[kind].totalRevenue,
  }));
  const trendByDate = new Map<string, { totalRevenue: number; totalExpense: number; totalQuantity: number }>();
  for (const revenue of scopedRevenues) {
    const entry = trendByDate.get(revenue.date) ?? { totalRevenue: 0, totalExpense: 0, totalQuantity: 0 };
    entry.totalRevenue += revenue.total;
    entry.totalQuantity += revenue.quantity;
    trendByDate.set(revenue.date, entry);
  }
  for (const expense of scopedExpenses) {
    const entry = trendByDate.get(expense.date) ?? { totalRevenue: 0, totalExpense: 0, totalQuantity: 0 };
    entry.totalExpense += expense.amount;
    trendByDate.set(expense.date, entry);
  }
  const dailyTrend = Array.from(trendByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, entry]) => ({
      date,
      totalRevenue: entry.totalRevenue,
      totalExpense: entry.totalExpense,
      netProfit: entry.totalRevenue - entry.totalExpense,
      totalQuantity: entry.totalQuantity,
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
    totalSoldQuantity,
    pizzaSoldQuantity: productCategoryBuckets.pizza.totalQuantity,
    drinkSoldQuantity: productCategoryBuckets.drink.totalQuantity,
    sauceSoldQuantity: productCategoryBuckets.sauce.totalQuantity,
    averageRevenueTicket,
    revenueCount: scopedRevenues.length,
    expenseCount: scopedExpenses.length,
    branchTotals: selectedBranchId === 'all' ? branchTotals : [],
    expenseBreakdown,
    topProducts,
    productCategoryTotals,
    dailyTrend,
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

            <View className="mt-4 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
              <Text className="mb-3 text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                ملخص الكميات
              </Text>
              <View className="flex-row-reverse flex-wrap gap-2">
                <QuantityPill label="إجمالي المنتجات" value={totalSoldQuantity} tone="primary" />
                <QuantityPill label="إجمالي البيتزا" value={productCategoryBuckets.pizza.totalQuantity} tone="success" />
                <QuantityPill label="إجمالي المشروبات" value={productCategoryBuckets.drink.totalQuantity} tone="info" />
                <QuantityPill label="إجمالي الصوصات" value={productCategoryBuckets.sauce.totalQuantity} tone="danger" />
              </View>
              <View className="mt-4 flex-row-reverse justify-between gap-2">
                <MetricItem label="عدد الإيرادات" value={String(scopedRevenues.length)} />
                <MetricItem label="عدد المصروفات" value={String(scopedExpenses.length)} />
                <MetricItem label="متوسط الفاتورة" value={formatAmount(averageRevenueTicket)} />
              </View>
            </View>

            {dailyTrend.length > 0 ? (
              <View className="mt-4 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                <Text className="mb-3 text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                  اتجاه المبيعات حسب الفترة
                </Text>
                <TrendBars rows={dailyTrend} />
              </View>
            ) : null}

            {productCategoryTotals.some((row) => row.totalQuantity > 0) ? (
              <View className="mt-4 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                <Text className="mb-3 text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                  توزيع الكميات حسب النوع
                </Text>
                {productCategoryTotals.map((row) => (
                  <CategoryBar key={row.category} label={row.category} value={row.totalQuantity} max={totalSoldQuantity} />
                ))}
              </View>
            ) : null}

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

function QuantityPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'primary' | 'success' | 'info' | 'danger';
}) {
  const toneClass =
    tone === 'success'
      ? 'border-success'
      : tone === 'danger'
        ? 'border-danger'
        : tone === 'info'
          ? 'border-secondary'
          : 'border-primary';
  return (
    <View className={`min-w-[47%] flex-1 rounded-xl border ${toneClass} px-3 py-2`}>
      <Text className="text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">{label}</Text>
      <Text className="mt-1 text-right font-cairo-bold text-lg text-text-primary dark:text-text-primary-dark">
        {value}
      </Text>
    </View>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-xl bg-background px-2 py-2 dark:bg-background-dark">
      <Text className="text-center font-cairo text-[11px] text-text-secondary dark:text-text-secondary-dark">
        {label}
      </Text>
      <Text className="mt-1 text-center font-cairo-semibold text-sm text-text-primary dark:text-text-primary-dark">
        {value}
      </Text>
    </View>
  );
}

function CategoryBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  return (
    <View className="mb-3">
      <View className="mb-1 flex-row-reverse items-center justify-between">
        <Text className="font-cairo-medium text-xs text-text-primary dark:text-text-primary-dark">{label}</Text>
        <Text className="font-cairo-semibold text-xs text-text-secondary dark:text-text-secondary-dark">{value}</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-background dark:bg-background-dark">
        <View className="h-2 rounded-full bg-primary dark:bg-primary-dark" style={{ width: `${width}%` }} />
      </View>
    </View>
  );
}

function TrendBars({ rows }: { rows: ReportData['dailyTrend'] }) {
  const max = Math.max(...rows.map((row) => row.totalRevenue), 1);
  return (
    <View className="gap-2">
      {rows.slice(-10).map((row) => {
        const width = Math.max(5, Math.round((row.totalRevenue / max) * 100));
        return (
          <View key={row.date}>
            <View className="mb-1 flex-row-reverse items-center justify-between">
              <Text className="font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">{row.date}</Text>
              <Text className="font-cairo-semibold text-xs text-success dark:text-success-dark">
                {formatAmount(row.totalRevenue)}
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-background dark:bg-background-dark">
              <View className="h-2 rounded-full bg-success dark:bg-success-dark" style={{ width: `${width}%` }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
