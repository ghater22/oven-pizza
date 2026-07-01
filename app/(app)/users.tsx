import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/EmptyState';
import { useAuthStore } from '@/src/store/auth';

export default function UsersScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: 'المستخدمون', headerBackTitle: 'رجوع' }} />

      <View className="px-5 py-4">
        {user && profile ? (
          <View className="rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
            <Text className="text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
              {profile.displayName ?? 'مالك بيتزا الفرن'}
            </Text>
            <Text className="mt-1 text-right font-cairo text-sm text-text-secondary dark:text-text-secondary-dark">
              {profile.email ?? user.email}
            </Text>
            <Text className="mt-3 text-right font-cairo-medium text-sm text-success dark:text-success-dark">
              الصلاحية: {profile.role === 'owner' ? 'مالك' : 'محاسب'}
            </Text>
          </View>
        ) : (
          <EmptyState title="لا يوجد مستخدم نشط" description="سجل الدخول لعرض بيانات المستخدم." />
        )}
      </View>
    </SafeAreaView>
  );
}
