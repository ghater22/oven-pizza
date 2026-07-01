import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/EmptyState';
import { PeriodSelector } from '@/src/components/PeriodSelector';
import { TimeAnalyticsSection } from '@/src/components/TimeAnalyticsSection';
import {
  aggregateProductPerformance,
  aggregateProductPerformanceByBranch,
  bottomByQuantity,
  topByProfit,
  topByQuantity,
} from '@/src/features/analytics/productPerformance';
import { useProducts } from '@/src/hooks/useProducts';
import { useRevenuesForRange } from '@/src/hooks/useRevenuesForRange';
import { formatAmount } from '@/src/utils/currency';
import { type AnalyticsPeriod, dateRangeForPeriod } from '@/src/utils/date';

function RankedRow({
  rank,
  title,
  subtitle,
  value,
  tone,
}: {
  rank: number;
  title: string;
  subtitle: string;
  value: string;
  tone: 'success' | 'danger' | 'neutral';
}) {
  const toneClass =
    tone === 'success'
      ? 'text-success dark:text-success-dark'
      : tone === 'danger'
        ? 'text-danger dark:text-danger-dark'
        : 'text-text-primary dark:text-text-primary-dark';

  return (
    <View className="mb-2 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
      <View className="flex-row-reverse items-center gap-3">
        <Text className="font-cairo-bold text-sm text-text-secondary dark:text-text-secondary-dark">
          {rank}
        </Text>
        <View>
          <Text className="font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
            {title}
          </Text>
          <Text className="text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
            {subtitle}
          </Text>
        </View>
      </View>
      <Text className={`font-cairo-semibold text-sm ${toneClass}`}>{value}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const [subTab, setSubTab] = useState<'products' | 'time'>('products');
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');

  const { startDate, endDate } = dateRangeForPeriod(period);
  const { revenues, revenuesByBranch, branches, loading } = useRevenuesForRange(startDate, endDate);
  const { products } = useProducts();

  const performance = aggregateProductPerformance(revenues, products);
  const hasEnoughData = performance.length > 0;
  const top = topByQuantity(performance);
  const bottom = performance.length >= 3 ? bottomByQuantity(performance) : [];
  const topProfit = topByProfit(performance);

  const byBranchPerformance = aggregateProductPerformanceByBranch(revenuesByBranch, products);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <View className="px-5 py-4">
        <Text className="font-cairo-bold text-xl text-text-primary dark:text-text-primary-dark">
          التحليلات
        </Text>
      </View>

      <View className="flex-row-reverse gap-2 px-5 pb-3">
        {(
          [
            { key: 'products', label: 'المنتجات' },
            { key: 'time', label: 'الأوقات' },
          ] as const
        ).map((tab) => {
          const active = tab.key === subTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setSubTab(tab.key)}
              className={`flex-1 items-center rounded-full py-2 ${
                active ? 'bg-secondary' : 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
              }`}
            >
              <Text
                className={`font-cairo-medium text-sm ${active ? 'text-white' : 'text-text-secondary dark:text-text-secondary-dark'}`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PeriodSelector value={period} onChange={setPeriod} />

      {subTab === 'time' ? (
        loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#D64535" size="large" />
          </View>
        ) : (
          <TimeAnalyticsSection revenues={revenues} />
        )
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#D64535" size="large" />
        </View>
      ) : !hasEnoughData ? (
        <EmptyState
          title="لا توجد بيانات كافية"
          description="سجّل بعض الإيرادات خلال هذه الفترة لعرض تحليل المنتجات."
        />
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-8">
          <Text className="mb-3 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
            الأكثر مبيعًا (بالكمية)
          </Text>
          {top.map((item, index) => (
            <RankedRow
              key={item.productId}
              rank={index + 1}
              title={item.productName}
              subtitle={`${item.totalQuantity} قطعة`}
              value={formatAmount(item.totalRevenue)}
              tone="success"
            />
          ))}

          {topProfit.length > 0 ? (
            <>
              <Text className="mb-3 mt-6 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                الأعلى ربحًا
              </Text>
              {topProfit.map((item, index) => (
                <RankedRow
                  key={item.productId}
                  rank={index + 1}
                  title={item.productName}
                  subtitle={`${item.totalQuantity} قطعة`}
                  value={formatAmount(item.estimatedProfit ?? 0)}
                  tone="success"
                />
              ))}
            </>
          ) : null}

          {bottom.length > 0 ? (
            <>
              <Text className="mb-3 mt-6 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                منتجات تحتاج مراجعة
              </Text>
              {bottom.map((item, index) => (
                <RankedRow
                  key={item.productId}
                  rank={index + 1}
                  title={item.productName}
                  subtitle={`${item.totalQuantity} قطعة`}
                  value={formatAmount(item.totalRevenue)}
                  tone="danger"
                />
              ))}
            </>
          ) : null}

          {branches.length > 1 ? (
            <>
              <Text className="mb-3 mt-6 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                مقارنة المنتجات بين الفروع (الكمية المباعة)
              </Text>
              {performance.map((item) => (
                <View
                  key={item.productId}
                  className="mb-2 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
                >
                  <Text className="mb-2 text-right font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
                    {item.productName}
                  </Text>
                  <View className="flex-row-reverse flex-wrap gap-3">
                    {branches.map((branch) => {
                      const branchItem = byBranchPerformance[branch.id]?.find(
                        (entry) => entry.productId === item.productId
                      );
                      return (
                        <Text
                          key={branch.id}
                          className="font-cairo text-xs text-text-secondary dark:text-text-secondary-dark"
                        >
                          {branch.name}: {branchItem?.totalQuantity ?? 0}
                        </Text>
                      );
                    })}
                  </View>
                </View>
              ))}
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
