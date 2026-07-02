import { Redirect, Tabs, useSegments } from 'expo-router';
import { useColorScheme } from 'nativewind';

import { AppIcon } from '@/src/components/AppIcon';
import { useAuthStore } from '@/src/store/auth';

const COLORS = {
  light: { active: '#D64535', inactive: '#7A6A5F', bg: '#FFFFFF', border: '#EDE0D4' },
  dark: { active: '#FF6B54', inactive: '#B8A99B', bg: '#2A2019', border: '#3D3128' },
};

export default function AppLayout() {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === 'dark' ? COLORS.dark : COLORS.light;
  const segments = useSegments();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const initializing = useAuthStore((state) => state.initializing);
  const isAccountant = profile?.role === 'accountant';
  const currentRoute = String(segments[segments.length - 1] ?? '');

  if (!initializing && !(user && profile)) {
    return <Redirect href="/login" />;
  }

  if (isAccountant && currentRoute && !['revenue', 'expenses'].includes(currentRoute)) {
    return <Redirect href="/revenue" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.active,
        tabBarInactiveTintColor: palette.inactive,
        tabBarStyle: {
          backgroundColor: palette.bg,
          borderTopColor: palette.border,
          height: 60,
          marginBottom: 26,
          paddingTop: 4,
          paddingBottom: 6,
        },
        sceneStyle: { backgroundColor: palette.bg },
        tabBarItemStyle: { height: 50, paddingVertical: 0 },
        tabBarIconStyle: { marginTop: 2, marginBottom: -2 },
        tabBarLabelStyle: {
          fontFamily: 'Cairo_500Medium',
          fontSize: 10,
          lineHeight: 13,
          marginTop: -2,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'الرئيسية',
          href: isAccountant ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="home" color={String(color)} size={Math.min(size, 22)} />
          ),
        }}
      />
      <Tabs.Screen
        name="revenue"
        options={{
          title: 'الإيرادات',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="trending-up" color={String(color)} size={Math.min(size, 22)} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'المصروفات',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="trending-down" color={String(color)} size={Math.min(size, 22)} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'التحليلات',
          href: isAccountant ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="chart" color={String(color)} size={Math.min(size, 22)} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'التقارير',
          href: isAccountant ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="document" color={String(color)} size={Math.min(size, 22)} />
          ),
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="branches" options={{ href: null }} />
      <Tabs.Screen name="products" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="users" options={{ href: null }} />
      <Tabs.Screen name="backup" options={{ href: null }} />
    </Tabs>
  );
}
