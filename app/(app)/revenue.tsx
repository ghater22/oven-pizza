import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/EmptyState';

export default function RevenueScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <EmptyState
        title="إدارة الإيرادات"
        description="تسجيل وعرض الإيرادات حسب الفرع والمنتج والوقت — قادم في السبرنت 2."
      />
    </SafeAreaView>
  );
}
