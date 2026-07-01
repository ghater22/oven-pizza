import { router, Stack } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/src/components/AppIcon';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { PwaInstallButton } from '@/src/components/PwaInstallButton';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { signOutUser } from '@/src/firebase/auth';

export default function SettingsScreen() {
  async function handleLogout() {
    await signOutUser();
    router.replace('/login');
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: 'الإعدادات', headerBackTitle: 'رجوع' }} />

      <View className="px-5 py-4">
        <Text className="mb-2 font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
          المظهر
        </Text>
        <ThemeToggle />

        <Pressable
          onPress={() => router.push('/branches')}
          accessibilityRole="button"
          className="mt-8 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
        >
          <Text className="font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
            إدارة الفروع
          </Text>
          <AppIcon name="chevron-left" size={18} color="#7A6A5F" />
        </Pressable>

        <Pressable
          onPress={() => router.push('/products')}
          accessibilityRole="button"
          className="mt-3 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
        >
          <Text className="font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
            إدارة المنتجات
          </Text>
          <AppIcon name="chevron-left" size={18} color="#7A6A5F" />
        </Pressable>

        <Pressable
          onPress={() => router.push('/activity' as never)}
          accessibilityRole="button"
          className="mt-3 flex-row-reverse items-center justify-between rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
        >
          <Text className="font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
            سجل العمليات
          </Text>
          <AppIcon name="chevron-left" size={18} color="#7A6A5F" />
        </Pressable>

        <Pressable
          onPress={() => router.push('/users' as never)}
          accessibilityRole="button"
          className="mt-3 flex-row-reverse items-center justify-between rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
        >
          <Text className="font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
            المستخدمون والصلاحيات
          </Text>
          <AppIcon name="chevron-left" size={18} color="#7A6A5F" />
        </Pressable>

        <Pressable
          onPress={() => router.push('/backup' as never)}
          accessibilityRole="button"
          className="mt-3 flex-row-reverse items-center justify-between rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
        >
          <Text className="font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
            النسخ الاحتياطي والتصدير
          </Text>
          <AppIcon name="chevron-left" size={18} color="#7A6A5F" />
        </Pressable>

        <View className="mt-8 gap-3">
          <PwaInstallButton />
          <PrimaryButton label="تسجيل الخروج" onPress={handleLogout} variant="secondary" />
        </View>
      </View>
    </SafeAreaView>
  );
}
