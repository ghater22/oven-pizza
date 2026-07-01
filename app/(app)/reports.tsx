import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/EmptyState';

export default function ReportsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <EmptyState
        title="التقارير"
        description="تقارير يومية وأسبوعية وشهرية قابلة للتصدير PDF/Excel — قادم في السبرنت 7."
      />
    </SafeAreaView>
  );
}
