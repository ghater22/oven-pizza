import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/EmptyState';

export default function ExpensesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <EmptyState
        title="إدارة المصروفات"
        description="تسجيل وعرض المصروفات حسب التصنيف والفرع — قادم في السبرنت 3."
      />
    </SafeAreaView>
  );
}
