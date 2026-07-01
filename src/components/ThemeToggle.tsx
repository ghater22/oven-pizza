import { Pressable, Text, View } from 'react-native';

import { type ThemeMode, useThemeStore } from '@/src/store/theme';

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'فاتح' },
  { mode: 'dark', label: 'داكن' },
  { mode: 'system', label: 'تلقائي' },
];

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <View className="flex-row-reverse gap-2">
      {OPTIONS.map((option) => {
        const active = option.mode === mode;
        return (
          <Pressable
            key={option.mode}
            onPress={() => setMode(option.mode)}
            accessibilityRole="button"
            accessibilityLabel={`الوضع ${option.label}`}
            className={`rounded-full px-4 py-2 ${
              active ? 'bg-primary dark:bg-primary-dark' : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark'
            }`}
          >
            <Text
              className={`font-cairo-medium text-xs ${
                active ? 'text-white' : 'text-text-secondary dark:text-text-secondary-dark'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
