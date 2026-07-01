import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { Insight } from '@/src/features/analytics/insights';

const TONE_STYLES: Record<
  Insight['tone'],
  { text: string; border: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
  warning: {
    text: 'text-danger dark:text-danger-dark',
    border: 'border-danger dark:border-danger-dark',
    icon: 'alert-circle',
    iconColor: '#B3261E',
  },
  positive: {
    text: 'text-success dark:text-success-dark',
    border: 'border-success dark:border-success-dark',
    icon: 'trending-up',
    iconColor: '#3E8E4F',
  },
  info: {
    text: 'text-text-primary dark:text-text-primary-dark',
    border: 'border-secondary dark:border-secondary-dark',
    icon: 'information-circle',
    iconColor: '#F2A93B',
  },
};

export function InsightBanner({ insight }: { insight: Insight }) {
  const style = TONE_STYLES[insight.tone];

  return (
    <View
      className={`mb-2 flex-row-reverse items-center gap-2 rounded-2xl border bg-surface p-3 dark:bg-surface-dark ${style.border}`}
    >
      <Ionicons name={style.icon} size={18} color={style.iconColor} />
      <Text className={`flex-1 text-right font-cairo-medium text-sm ${style.text}`}>
        {insight.message}
      </Text>
    </View>
  );
}
