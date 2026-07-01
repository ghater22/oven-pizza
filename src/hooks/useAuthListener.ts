import { useEffect } from 'react';

import { fetchUserProfile } from '@/src/features/auth/service';
import { signOutUser, subscribeToAuthChanges } from '@/src/firebase/auth';
import { useAuthStore } from '@/src/store/auth';

/** يشترك في حالة مصادقة Firebase مرة واحدة عند إقلاع التطبيق ويزامنها مع authStore. */
export function useAuthListener(): void {
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setInitializing = useAuthStore((state) => state.setInitializing);
  const setError = useAuthStore((state) => state.setError);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToAuthChanges(async (user) => {
        setUser(user);

        if (!user) {
          setProfile(null);
          setInitializing(false);
          return;
        }

        try {
          const profile = await fetchUserProfile(user.uid, user.email, user.displayName);
          setProfile(profile);
          setError(null);
          setInitializing(false);
        } catch (err) {
          // لا صلاحية Firestore لهذا الحساب — تسجيل خروج تلقائي بدل ترك المستخدم على
          // لوحة تحكم معطّلة بأخطاء "permission-denied" في كل استعلام.
          setError((err as Error).message);
          await signOutUser();
        }
      });

      return unsubscribe;
    } catch (err) {
      // Firebase غير مُهيّأ بعد (مثلاً .env فارغ) — نعرض الرسالة بدل تعطّل التطبيق بالكامل.
      setError((err as Error).message);
      setInitializing(false);
      return undefined;
    }
  }, [setUser, setProfile, setInitializing, setError]);
}
