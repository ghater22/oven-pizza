import { Pressable, Text, View } from 'react-native';

import { type AnalyticsPeriod, PERIOD_LABELS } from '@/src/utils/date';

const PERIODS: AnalyticsPeriod[] = ['today', 'week', 'month'];

interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <View className="flex-row-reverse gap-2 px-5 pb-3">
      {PERIODS.map((period) => {
        const active = period === value;
        return (
          <Pressable
            key={period}
            onPress={() => onChange(period)}
            accessibilityRole="button"
            accessibilityLabel={PERIOD_LABELS[period]}
            className={`flex-1 items-center rounded-full py-2 ${
              active
                ? 'bg-primary dark:bg-primary-dark'
                : 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
            }`}
          >
            <Text
              className={`font-cairo-medium text-sm ${
                active ? 'text-white' : 'text-text-secondary dark:text-text-secondary-dark'
              }`}
            >
              {PERIOD_LABELS[period]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
