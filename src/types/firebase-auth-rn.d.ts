// حزمة "firebase/auth" لا تُصدّر typings لـ getReactNativePersistence عبر خريطة exports
// الخاصة بها (فجوة معروفة في التغليف)، رغم أن الكود الفعلي وقت التشغيل يحل بشكل صحيح
// إلى بناء React Native عبر Metro. هذا التصريح يسد فجوة الأنواع فقط.
import type { Persistence } from '@firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}

export {};
