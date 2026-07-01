import { Stack } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { exportFullBackup } from '@/src/features/backup/export';
import { useBranches } from '@/src/hooks/useBranches';
import { useExpensesForRange } from '@/src/hooks/useExpensesForRange';
import { useOperationLogs } from '@/src/hooks/useOperationLogs';
import { useProducts } from '@/src/hooks/useProducts';
import { useRevenuesForRange } from '@/src/hooks/useRevenuesForRange';
import { todayKey } from '@/src/utils/date';

export default function BackupScreen() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { branches, loading: branchesLoading } = useBranches();
  const { products, loading: productsLoading } = useProducts();
  const { revenues, loading: revenuesLoading } = useRevenuesForRange('2020-01-01', todayKey());
  const { expenses, loading: expensesLoading } = useExpensesForRange('2020-01-01', todayKey());
  const { logs, loading: logsLoading } = useOperationLogs();

  const loading = branchesLoading || productsLoading || revenuesLoading || expensesLoading || logsLoading;

  async function handleExport() {
    setError(null);
    setExporting(true);
    try {
      await exportFullBackup({ branches, products, revenues, expenses, logs });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: 'النسخ الاحتياطي', headerBackTitle: 'رجوع' }} />

      <View className="flex-1 px-5 py-4">
        {loading ? (
          <EmptyState title="جار تجهيز البيانات" description="يتم جمع الفروع والمنتجات والإيرادات والمصروفات." />
        ) : (
          <View className="rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
            <Text className="text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
              نسخة Excel شاملة
            </Text>
            <Text className="mt-2 text-right font-cairo text-sm text-text-secondary dark:text-text-secondary-dark">
              تشمل الفروع، المنتجات، الإيرادات، المصروفات، وسجل العمليات.
            </Text>
            <Text className="mt-3 text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
              الفروع: {branches.length} | المنتجات: {products.length} | الإيرادات: {revenues.length} | المصروفات:{' '}
              {expenses.length}
            </Text>
            {error ? (
              <Text className="mt-3 text-center font-cairo text-sm text-danger dark:text-danger-dark">
                {error}
              </Text>
            ) : null}
            <View className="mt-4">
              <PrimaryButton label="تنزيل نسخة احتياطية" onPress={handleExport} loading={exporting} />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
