import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { signOutUser } from '@/src/firebase/auth';

export default function DashboardScreen() {
  async function handleLogout() {
    try {
      await signOutUser();
    } finally {
      router.replace('/login');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <View className="flex-row-reverse items-center justify-between px-5 py-4">
        <Text className="font-cairo-bold text-xl text-text-primary dark:text-text-primary-dark">
          الرئيسية
        </Text>
        <ThemeToggle />
      </View>

      <EmptyState
        title="لوحة التحكم قيد الإعداد"
        description="سيتم عرض دخل ومصروفات وأرباح اليوم ومقارنة الفروع هنا في السبرنت القادم."
      />

      <View className="px-6 pb-6">
        <PrimaryButton label="تسجيل الخروج" onPress={handleLogout} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}
