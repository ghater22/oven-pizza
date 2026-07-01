import { I18nManager, Platform } from 'react-native';

/**
 * يفرض اتجاه RTL للتطبيق بالكامل (عربي فقط، بدون تعدد لغات).
 * على الأجهزة الأصلية أول مرة قد يتطلب إعادة تشغيل التطبيق يدويًا
 * لأن I18nManager يحفظ الإعداد للتشغيلة القادمة فقط.
 */
export function ensureRTL(): void {
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }
    return;
  }

  if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }
}
