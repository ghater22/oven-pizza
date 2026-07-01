import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { getFirebaseAuth } from './config';

export type AuthErrorCode =
  | 'invalid-credentials'
  | 'too-many-requests'
  | 'network-error'
  | 'unknown';

const ARABIC_AUTH_ERRORS: Record<AuthErrorCode, string> = {
  'invalid-credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'too-many-requests': 'محاولات كثيرة جدًا، حاول لاحقًا',
  'network-error': 'تعذّر الاتصال بالخادم، تحقق من الإنترنت',
  unknown: 'حدث خطأ غير متوقع، حاول مرة أخرى',
};

function toAuthErrorCode(error: unknown): AuthErrorCode {
  const code = (error as { code?: string })?.code ?? '';
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/invalid-email' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'invalid-credentials';
  }
  if (code === 'auth/too-many-requests') return 'too-many-requests';
  if (code === 'auth/network-request-failed') return 'network-error';
  return 'unknown';
}

export function getAuthErrorMessage(error: unknown): string {
  return ARABIC_AUTH_ERRORS[toAuthErrorCode(error)];
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
