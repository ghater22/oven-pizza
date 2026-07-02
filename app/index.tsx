import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '@/src/store/auth';

export default function Index() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const initializing = useAuthStore((state) => state.initializing);

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator color="#D64535" size="large" />
      </View>
    );
  }

  if (user && profile) {
    return <Redirect href={profile.role === 'accountant' ? '/revenue' : '/dashboard'} />;
  }

  return <Redirect href="/login" />;
}
