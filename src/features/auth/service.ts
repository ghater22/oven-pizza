import { doc, getDoc } from 'firebase/firestore';

import { getFirestoreDb } from '@/src/firebase/config';

import type { AppUserProfile, UserRole } from './types';

export async function fetchUserProfile(
  uid: string,
  email: string | null,
  displayName: string | null
): Promise<AppUserProfile> {
  const snapshot = await getDoc(doc(getFirestoreDb(), 'users', uid));

  if (!snapshot.exists()) {
    throw new Error(
      'لا توجد صلاحية لهذا الحساب. يجب إضافة المستخدم يدويًا في Firestore (users/{uid}) — راجع docs/FIREBASE_STRUCTURE.md'
    );
  }

  const data = snapshot.data();

  return {
    uid,
    email,
    displayName,
    role: (data.role as UserRole) ?? 'owner',
    branchIds: Array.isArray(data.branchIds) ? (data.branchIds as string[]) : [],
  };
}
