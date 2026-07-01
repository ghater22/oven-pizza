import { Stack } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/EmptyState';
import { useOperationLogs } from '@/src/hooks/useOperationLogs';

const ACTION_LABELS = {
  create: 'إضافة',
  update: 'تعديل',
  delete: 'حذف',
};

const ENTITY_LABELS = {
  revenue: 'إيراد',
  expense: 'مصروف',
  branch: 'فرع',
  product: 'منتج',
  user: 'مستخدم',
};

export default function ActivityScreen() {
  const { logs, loading } = useOperationLogs();

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: 'سجل العمليات', headerBackTitle: 'رجوع' }} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#D64535" size="large" />
        </View>
      ) : logs.length === 0 ? (
        <EmptyState title="لا توجد عمليات بعد" description="ستظهر هنا عمليات الإضافة والتعديل والحذف." />
      ) : (
        <ScrollView contentContainerClassName="px-5 py-4">
          {logs.map((log) => (
            <View
              key={log.id}
              className="mb-2 rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
            >
              <View className="flex-row-reverse items-center justify-between">
                <Text className="font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                  {ACTION_LABELS[log.action]} {ENTITY_LABELS[log.entity]}
                </Text>
                <Text className="font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                  {log.createdAt.toLocaleString('ar-SA')}
                </Text>
              </View>
              <Text className="mt-1 text-right font-cairo text-sm text-text-secondary dark:text-text-secondary-dark">
                {log.label}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
