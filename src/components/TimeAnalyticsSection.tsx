import { ScrollView, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import {
  aggregateByDayOfWeek,
  aggregateByHour,
  bestDays,
  formatHourLabel,
  peakHours,
  slowHours,
  worstDays,
} from '@/src/features/analytics/timePerformance';
import type { Revenue } from '@/src/features/revenue/types';
import { EmptyState } from '@/src/components/EmptyState';

interface TimeAnalyticsSectionProps {
  revenues: Revenue[];
}

export function TimeAnalyticsSection({ revenues }: TimeAnalyticsSectionProps) {
  if (revenues.length === 0) {
    return (
      <EmptyState
        title="لا توجد بيانات كافية"
        description="سجّل بعض الإيرادات خلال هذه الفترة لعرض تحليل الأوقات."
      />
    );
  }

  const hourBuckets = aggregateByHour(revenues);
  const dayBuckets = aggregateByDayOfWeek(revenues);

  const peak = peakHours(hourBuckets);
  const slow = slowHours(hourBuckets);
  const best = bestDays(dayBuckets);
  const worst = worstDays(dayBuckets);

  const hourChartData = hourBuckets.map((bucket) => ({
    value: bucket.total,
    label: bucket.hour % 3 === 0 ? formatHourLabel(bucket.hour) : '',
    frontColor: '#F2A93B',
  }));

  const dayChartData = dayBuckets.map((bucket) => ({
    value: bucket.total,
    label: bucket.label,
    frontColor: '#D64535',
  }));

  return (
    <ScrollView contentContainerClassName="px-5 pb-8">
      <Text className="mb-3 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
        المبيعات حسب الساعة
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={hourChartData}
          barWidth={14}
          spacing={8}
          height={140}
          hideRules
          yAxisTextStyle={{ color: '#B8A99B', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#B8A99B', fontSize: 10 }}
          noOfSections={3}
        />
      </ScrollView>
      {peak.length > 0 ? (
        <Text className="mt-2 text-right font-cairo text-xs text-success dark:text-success-dark">
          أفضل الساعات: {peak.map((bucket) => formatHourLabel(bucket.hour)).join('، ')}
        </Text>
      ) : null}
      {slow.length > 0 ? (
        <Text className="mt-1 text-right font-cairo text-xs text-danger dark:text-danger-dark">
          أضعف الساعات: {slow.map((bucket) => formatHourLabel(bucket.hour)).join('، ')}
        </Text>
      ) : null}

      <Text className="mb-3 mt-6 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
        المبيعات حسب يوم الأسبوع
      </Text>
      <BarChart
        data={dayChartData}
        barWidth={28}
        spacing={16}
        height={140}
        hideRules
        yAxisTextStyle={{ color: '#B8A99B', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#B8A99B', fontSize: 10 }}
        noOfSections={3}
      />
      {best.length > 0 ? (
        <Text className="mt-2 text-right font-cairo text-xs text-success dark:text-success-dark">
          أفضل الأيام: {best.map((bucket) => bucket.label).join('، ')}
        </Text>
      ) : null}
      {worst.length > 0 ? (
        <Text className="mt-1 text-right font-cairo text-xs text-danger dark:text-danger-dark">
          أضعف الأيام: {worst.map((bucket) => bucket.label).join('، ')}
        </Text>
      ) : null}

      <View className="h-4" />
    </ScrollView>
  );
}
