import { Alert, Platform } from 'react-native';

export function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (typeof globalThis.confirm === 'function' && globalThis.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'إلغاء', style: 'cancel' },
    { text: 'حذف', style: 'destructive', onPress: onConfirm },
  ]);
}

export function confirmSaveAction(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  onCancel?: () => void
) {
  if (Platform.OS === 'web') {
    if (typeof globalThis.confirm === 'function' && globalThis.confirm(`${title}\n\n${message}`)) {
      void onConfirm();
    } else {
      onCancel?.();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'إلغاء', style: 'cancel', onPress: onCancel },
    { text: 'اعتماد الحفظ', onPress: () => void onConfirm() },
  ]);
}
