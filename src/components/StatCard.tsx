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
    <View className="flex-1 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
      <View className="flex-row-reverse items-center justify-between">
        <Text className="font-cairo-medium text-xs text-text-secondary dark:text-text-secondary-dark">
          {title}
        </Text>
        <AppIcon name={icon} size={18} color="#F2A93B" />
      </View>
      <Text className={`mt-2 text-right font-cairo-bold text-xl ${TONE_TEXT[tone]}`}>
        {formatAmount(value)}
      </Text>
    </View>
  );
}
