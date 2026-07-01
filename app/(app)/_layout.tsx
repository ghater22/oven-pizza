import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';

import { useAuthStore } from '@/src/store/auth';

const COLORS = {
  light: { active: '#D64535', inactive: '#7A6A5F', bg: '#FFFFFF', border: '#EDE0D4' },
  dark: { active: '#FF6B54', inactive: '#B8A99B', bg: '#2A2019', border: '#3D3128' },
};

export default function AppLayout() {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === 'dark' ? COLORS.dark : COLORS.light;

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const initializing = useAuthStore((state) => state.initializing);

  if (!initializing && !(user && profile)) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.active,
        tabBarInactiveTintColor: palette.inactive,
        tabBarStyle: { backgroundColor: palette.bg, borderTopColor: palette.border },
        tabBarLabelStyle: { fontFamily: 'Cairo_500Medium', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="revenue"
        options={{
          title: 'الإيرادات',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'المصروفات',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-down" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'التحليلات',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'التقارير',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="branches" options={{ href: null }} />
    </Tabs>
  );
}
