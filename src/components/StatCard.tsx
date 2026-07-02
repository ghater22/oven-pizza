import { Text, View } from 'react-native';

import { formatAmount } from '@/src/utils/currency';

import { AppIcon, type AppIconName } from './AppIcon';

interface StatCardProps {
  title: string;
  value: number;
  icon: AppIconName;
  tone?: 'neutral' | 'success' | 'danger';
}

const TONE_TEXT: Record<NonNullable<StatCardProps['tone']>, string> = {
  neutral: 'text-text-primary dark:text-text-primary-dark',
  success: 'text-success dark:text-success-dark',
  danger: 'text-danger dark:text-danger-dark',
};

export function StatCard({ title, value, icon, tone = 'neutral' }: StatCardProps) {
  return (
    <View className="min-h-28 flex-1 justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
      <View className="flex-row-reverse items-start justify-between gap-3">
        <Text numberOfLines={1} className="flex-1 text-right font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
          {title}
        </Text>
        <View className="h-8 w-8 items-center justify-center rounded-xl bg-secondary/10 dark:bg-secondary-dark/10">
          <AppIcon name={icon} size={20} color="#F2A93B" />
        </View>
      </View>
      <Text className={`mt-4 text-right font-cairo-bold text-2xl ${TONE_TEXT[tone]}`}>
        {formatAmount(value)}
      </Text>
    </View>
  );
}
