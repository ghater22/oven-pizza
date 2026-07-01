import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/src/components/AppIcon';
import { BranchSwitcher } from '@/src/components/BranchSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { InsightBanner } from '@/src/components/InsightBanner';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { StatCard } from '@/src/components/StatCard';
import { useDashboardSummary } from '@/src/hooks/useDashboardSummary';
import { useSmartInsights } from '@/src/hooks/useSmartInsights';
import { useBranchStore } from '@/src/store/branch';
import { formatAmount } from '@/src/utils/currency';

export default function DashboardScreen() {
  const { branches, summary, loading } = useDashboardSummary();
  const { insights } = useSmartInsights();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const selectedTotals =
    selectedBranchId === 'all'
      ? { totalRevenue: summary.totalRevenue, totalExpense: summary.totalExpense, netProfit: summary.netProfit }
      : (summary.byBranch.find((branch) => branch.branchId === selectedBranchId) ?? {
          totalRevenue: 0,
          totalExpense: 0,
          netProfit: 0,
        });

  const bestBranch = branches.find((branch) => branch.id === summary.bestBranchId);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <View className="flex-row-reverse items-center justify-between px-5 py-4">
        <Text className="font-cairo-bold text-xl text-text-primary dark:text-text-primary-dark">
          الرئيسية
        </Text>
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="الإعدادات"
          className="h-10 w-10 items-center justify-center rounded-full bg-surface dark:bg-surface-dark"
        >
          <AppIcon name="settings" size={20} color="#7A6A5F" />
        </Pressable>
      </View>

      <BranchSwitcher />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#D64535" size="large" />
        </View>
      ) : branches.length === 0 ? (
        <View className="flex-1">
          <EmptyState
            title="لا توجد فروع بعد"
            description="أضف أول فرع من الإعدادات ← إدارة الفروع لبدء تسجيل الإيرادات والمصروفات."
          />
          <View className="px-6 pb-6">
            <PrimaryButton label="الذهاب إلى الإعدادات" onPress={() => router.push('/settings')} />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-8">
          <Text className="mb-3 font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
            اليوم
          </Text>
          <View className="flex-row-reverse gap-3">
            <StatCard title="الدخل" value={selectedTotals.totalRevenue} icon="trending-up" tone="success" />
            <StatCard title="المصروف" value={selectedTotals.totalExpense} icon="trending-down" tone="danger" />
          </View>
          <View className="mt-3">
            <StatCard
              title="صافي الربح"
              value={selectedTotals.netProfit}
              icon="wallet"
              tone={selectedTotals.netProfit >= 0 ? 'success' : 'danger'}
            />
          </View>

          {insights.length > 0 ? (
            <View className="mt-6">
              <Text className="mb-3 font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
                رؤى ذكية
              </Text>
              {insights.map((insight) => (
                <InsightBanner key={insight.id} insight={insight} />
              ))}
            </View>
          ) : null}

          {branches.length > 1 ? (
            <View className="mt-6">
              <Text className="mb-3 font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
                مقارنة الفروع اليوم
              </Text>
              {summary.byBranch.map((branchTotals) => {
                const branch = branches.find((item) => item.id === branchTotals.branchId);
                const isBest = branchTotals.branchId === summary.bestBranchId;
                return (
                  <View
                    key={branchTotals.branchId}
                    className="mb-2 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
                  >
                    <View className="flex-row-reverse items-center gap-2">
                      {isBest ? <AppIcon name="star" size={16} color="#F2A93B" /> : null}
                      <Text className="font-cairo-semibold text-sm text-text-primary dark:text-text-primary-dark">
                        {branch?.name ?? branchTotals.branchId}
                      </Text>
                    </View>
                    <Text
                      className={`font-cairo-semibold text-sm ${
                        branchTotals.netProfit >= 0
                          ? 'text-success dark:text-success-dark'
                          : 'text-danger dark:text-danger-dark'
                      }`}
                    >
                      {formatAmount(branchTotals.netProfit)}
                    </Text>
                  </View>
                );
              })}
              {bestBranch ? (
                <Text className="mt-1 text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                  أفضل فرع أداءً اليوم: {bestBranch.name}
                </Text>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
