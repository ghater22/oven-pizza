import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/EmptyState';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <EmptyState
        title="التحليلات"
        description="أداء المنتجات وتحليل الأوقات والرؤى الذكية — قادم في السبرنتات 4-6."
      />
    </SafeAreaView>
  );
}
