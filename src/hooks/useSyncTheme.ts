import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useEffect } from 'react';

import { useThemeStore } from '@/src/store/theme';

/** يزامن تفضيل الثيم المحفوظ للمستخدم مع محرك الألوان في NativeWind. */
export function useSyncTheme(): void {
  const mode = useThemeStore((state) => state.mode);
  const { setColorScheme } = useNativeWindColorScheme();

  useEffect(() => {
    setColorScheme(mode);
  }, [mode, setColorScheme]);
}
