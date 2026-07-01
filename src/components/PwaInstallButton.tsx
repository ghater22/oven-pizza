import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Text } from 'react-native';

import { AppIcon } from './AppIcon';
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const isStandaloneDisplay = () => {
  if (Platform.OS !== 'web') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
};

const isIosBrowser = () => {
  if (Platform.OS !== 'web') {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
};

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(() => isStandaloneDisplay());
  const isiOS = isIosBrowser();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstallPrompt(null);
      setIsStandalone(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (Platform.OS !== 'web' || isStandalone) {
    return null;
  }

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
      }
      return;
    }

    Alert.alert(
      'تثبيت التطبيق',
      isiOS
        ? 'على iPhone أو iPad: اضغط زر المشاركة في المتصفح، ثم اختر إضافة إلى الشاشة الرئيسية.'
        : 'من قائمة المتصفح اختر تثبيت التطبيق أو Install app. إذا لم يظهر الخيار، أعد تحميل الصفحة بعد ثوان.'
    );
  }

  return (
    <Pressable
      onPress={handleInstall}
      accessibilityRole="button"
      accessibilityLabel="تثبيت التطبيق"
      className="mt-3 flex-row-reverse items-center justify-center rounded-2xl border border-primary bg-surface px-4 py-3 dark:border-primary-dark dark:bg-surface-dark"
    >
      <AppIcon name="download" size={18} color="#D64535" />
      <Text className="mr-2 font-cairo-semibold text-sm text-primary dark:text-primary-dark">
        تثبيت التطبيق
      </Text>
    </Pressable>
  );
}
