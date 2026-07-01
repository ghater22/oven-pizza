import { Stack } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTextInput } from '@/src/components/AppTextInput';
import { ChipSelector } from '@/src/components/ChipSelector';
import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import type { UserRole } from '@/src/features/auth/types';
import { createManagedUser } from '@/src/features/users/service';
import { useAuthStore } from '@/src/store/auth';

const ROLE_OPTIONS: UserRole[] = ['owner', 'accountant'];
const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'مالك',
  accountant: 'محاسب',
};

export default function UsersScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('accountant');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!user || !profile || profile.role !== 'owner') return;
    if (!displayName.trim() || !email.trim() || password.length < 6) {
      setError('أدخل الاسم والبريد وكلمة مرور من 6 أحرف على الأقل.');
      return;
    }

    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      await createManagedUser({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        role,
        createdBy: user.uid,
      });
      setDisplayName('');
      setEmail('');
      setPassword('');
      setRole('accountant');
      setMessage('تم إنشاء المستخدم بنجاح.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: 'المستخدمون', headerBackTitle: 'رجوع' }} />

      <View className="px-5 py-4">
        {user && profile ? (
          <>
            <View className="mb-5 rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
              <Text className="text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                {profile.displayName ?? 'مالك بيتزا الفرن'}
              </Text>
              <Text className="mt-1 text-right font-cairo text-sm text-text-secondary dark:text-text-secondary-dark">
                {profile.email ?? user.email}
              </Text>
              <Text className="mt-3 text-right font-cairo-medium text-sm text-success dark:text-success-dark">
                صلاحيتك الحالية: {ROLE_LABELS[profile.role]}
              </Text>
            </View>

            {profile.role === 'owner' ? (
              <View className="rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                <Text className="mb-4 text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                  إنشاء مستخدم جديد
                </Text>
                <AppTextInput label="الاسم" value={displayName} onChangeText={setDisplayName} />
                <AppTextInput
                  label="البريد الإلكتروني"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <AppTextInput
                  label="كلمة المرور"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <ChipSelector
                  label="الصلاحية"
                  options={ROLE_OPTIONS.map((item) => ROLE_LABELS[item])}
                  value={ROLE_LABELS[role]}
                  onChange={(value) =>
                    setRole(value === ROLE_LABELS.owner ? 'owner' : 'accountant')
                  }
                />
                {error ? (
                  <Text className="mb-3 text-center font-cairo text-sm text-danger dark:text-danger-dark">
                    {error}
                  </Text>
                ) : null}
                {message ? (
                  <Text className="mb-3 text-center font-cairo text-sm text-success dark:text-success-dark">
                    {message}
                  </Text>
                ) : null}
                <PrimaryButton label="إنشاء المستخدم" onPress={handleCreate} loading={saving} />
              </View>
            ) : (
              <EmptyState title="صلاحية محدودة" description="إنشاء المستخدمين متاح للمالك فقط." />
            )}
          </>
        ) : (
          <EmptyState title="لا يوجد مستخدم نشط" description="سجل الدخول لعرض بيانات المستخدم." />
        )}
      </View>
    </SafeAreaView>
  );
}
