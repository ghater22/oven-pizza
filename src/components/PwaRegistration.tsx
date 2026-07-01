import { useEffect } from 'react';
import { Platform } from 'react-native';

export function PwaRegistration() {
  useEffect(() => {
    if (Platform.OS !== 'web' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Installation should not block the app if the browser rejects service workers.
    });
  }, []);

  return null;
}
