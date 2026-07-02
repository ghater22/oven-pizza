import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/src/components/AppIcon';
import { AppTextInput } from '@/src/components/AppTextInput';
import { ChipSelector } from '@/src/components/ChipSelector';
import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import type { UserRole } from '@/src/features/auth/types';
import { createManagedUser } from '@/src/features/users/service';
import { useBranches } from '@/src/hooks/useBranches';
import { useAuthStore } from '@/src/store/auth';

const ROLE_OPTIONS: UserRole[] = ['owner', 'accountant'];
const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'مالك',
  accountant: 'محاسب',
};

export default function UsersScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { branches } = useBranches();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('accountant');
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!user || !profile || profile.role !== 'owner') return;
    if (!displayName.trim() || !email.trim() || password.length < 6) {
      setError('أدخل الاسم والبريد وكلمة مرور من 6 أحرف على الأقل.');
      return;
    }
    if (role === 'accountant' && selectedBranchIds.length === 0) {
      setError('حدد فرعًا واحدًا على الأقل لصلاحية المحاسب.');
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
        branchIds: role === 'accountant' ? selectedBranchIds : [],
        createdBy: user.uid,
      });
      setDisplayName('');
      setEmail('');
      setPassword('');
      setRole('accountant');
      setSelectedBranchIds([]);
      setMessage('تم إنشاء المستخدم بنجاح.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function toggleBranch(branchId: string) {
    setSelectedBranchIds((current) =>
      current.includes(branchId)
        ? current.filter((id) => id !== branchId)
        : [...current, branchId]
    );
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
                  onChange={(value) => {
                    const nextRole = value === ROLE_LABELS.owner ? 'owner' : 'accountant';
                    setRole(nextRole);
                    if (nextRole === 'owner') {
                      setSelectedBranchIds([]);
                    }
                  }}
                />
                {role === 'accountant' ? (
                  <View className="mb-4">
                    <Text className="mb-2 text-right font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
                      الفروع المسموحة للمحاسب
                    </Text>
                    {branches.length === 0 ? (
                      <Text className="text-right font-cairo text-xs text-danger dark:text-danger-dark">
                        أضف فرعًا أولًا قبل إنشاء محاسب.
                      </Text>
                    ) : (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="h-12 items-center gap-2"
                      >
                        {branches.map((branch) => {
                          const active = selectedBranchIds.includes(branch.id);
                          return (
                            <Pressable
                              key={branch.id}
                              onPress={() => toggleBranch(branch.id)}
                              accessibilityRole="button"
                              accessibilityLabel={`صلاحية فرع ${branch.name}`}
                              className={`h-11 min-w-32 flex-row-reverse items-center justify-center gap-2 rounded-xl px-4 ${
                                active
                                  ? 'bg-primary dark:bg-primary-dark'
                                  : 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
                              }`}
                            >
                              <AppIcon
                                name={active ? 'check-circle' : 'close-circle'}
                                size={16}
                                color={active ? '#FFFFFF' : '#7A6A5F'}
                              />
                              <Text
                                numberOfLines={1}
                                className={`font-cairo-medium text-sm ${
                                  active ? 'text-white' : 'text-text-secondary dark:text-text-secondary-dark'
                                }`}
                              >
                                {branch.name}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>
                ) : null}
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
