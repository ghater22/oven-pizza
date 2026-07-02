import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { signOutUser } from '@/src/firebase/auth';
import { useAuthStore } from '@/src/store/auth';

import { AppIcon } from './AppIcon';

export function AccountantProfileBar() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  async function handleLogout() {
    await signOutUser();
    router.replace('/login');
  }

  return (
    <View className="mx-5 mb-4 rounded-xl border border-border bg-surface p-3 dark:border-border-dark dark:bg-surface-dark">
      <View className="flex-row-reverse items-center justify-between gap-3">
        <View className="flex-1 flex-row-reverse items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark/10">
            <AppIcon name="user" size={20} color="#D64535" />
          </View>
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-right font-cairo-semibold text-sm text-text-primary dark:text-text-primary-dark"
            >
              {profile?.displayName || 'محاسب'}
            </Text>
            <Text
              numberOfLines={1}
              className="mt-0.5 text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark"
            >
              {profile?.email || user?.email || 'حساب محاسب'}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="تسجيل الخروج"
          className="h-10 w-10 items-center justify-center rounded-full border border-danger dark:border-danger-dark"
        >
          <AppIcon name="log-out" size={19} color="#B3261E" />
        </Pressable>
      </View>
    </View>
  );
}
