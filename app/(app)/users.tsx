import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/src/components/AppIcon';
import { AppTextInput } from '@/src/components/AppTextInput';
import { ChipSelector } from '@/src/components/ChipSelector';
import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import type { UserRole } from '@/src/features/auth/types';
import {
  createManagedUser,
  deleteManagedUser,
  type ManagedUser,
  subscribeToManagedUsers,
  updateManagedUser,
} from '@/src/features/users/service';
import { useBranches } from '@/src/hooks/useBranches';
import { useAuthStore } from '@/src/store/auth';
import { confirmAction } from '@/src/utils/confirmAction';

const ROLE_OPTIONS: UserRole[] = ['owner', 'accountant'];
const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'مالك',
  accountant: 'محاسب',
};

export default function UsersScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { branches } = useBranches();

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('accountant');
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role !== 'owner') return;
    return subscribeToManagedUsers(setManagedUsers);
  }, [profile?.role]);

  function resetForm() {
    setEditingUser(null);
    setDisplayName('');
    setEmail('');
    setPassword('');
    setRole('accountant');
    setSelectedBranchIds([]);
    setError(null);
    setMessage(null);
  }

  function startEdit(target: ManagedUser) {
    setEditingUser(target);
    setDisplayName(target.displayName ?? '');
    setEmail(target.email ?? '');
    setPassword('');
    setRole(target.role);
    setSelectedBranchIds(target.role === 'accountant' ? (target.branchIds ?? []) : []);
    setError(null);
    setMessage(null);
  }

  function toggleBranch(branchId: string) {
    setSelectedBranchIds((current) =>
      current.includes(branchId)
        ? current.filter((id) => id !== branchId)
        : [...current, branchId]
    );
  }

  function selectRole(value: string) {
    const nextRole = value === ROLE_LABELS.owner ? 'owner' : 'accountant';
    setRole(nextRole);
    if (nextRole === 'owner') {
      setSelectedBranchIds([]);
    }
  }

  function validateForm() {
    if (!displayName.trim() || !email.trim()) {
      setError('أدخل الاسم والبريد الإلكتروني.');
      return false;
    }
    if (!editingUser && password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return false;
    }
    if (role === 'accountant' && selectedBranchIds.length === 0) {
      setError('حدد فرعًا واحدًا على الأقل لصلاحية المحاسب.');
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!user || !profile || profile.role !== 'owner' || !validateForm()) return;

    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      if (editingUser) {
        await updateManagedUser({
          uid: editingUser.uid,
          displayName: displayName.trim(),
          role,
          branchIds: role === 'accountant' ? selectedBranchIds : [],
          updatedBy: user.uid,
        });
        setMessage('تم حفظ تعديلات المستخدم.');
      } else {
        await createManagedUser({
          displayName: displayName.trim(),
          email: email.trim(),
          password,
          role,
          branchIds: role === 'accountant' ? selectedBranchIds : [],
          createdBy: user.uid,
        });
        setMessage('تم إنشاء المستخدم بنجاح.');
      }
      resetForm();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(target: ManagedUser) {
    if (!user || target.uid === user.uid) return;
    const label = target.displayName || target.email || 'مستخدم';
    confirmAction('حذف مستخدم', `سيتم إلغاء صلاحية دخول ${label}. هل تريد المتابعة؟`, async () => {
      setSaving(true);
      try {
        await deleteManagedUser(target.uid, label, user.uid);
        if (editingUser?.uid === target.uid) {
          resetForm();
        }
        setMessage('تم حذف صلاحية المستخدم.');
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setSaving(false);
      }
    });
  }

  function branchSummary(target: ManagedUser) {
    if (target.role === 'owner') return 'كل الفروع';
    const names = branches
      .filter((branch) => target.branchIds?.includes(branch.id))
      .map((branch) => branch.name);
    return names.length > 0 ? names.join('، ') : 'بدون فروع';
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: 'المستخدمون', headerBackTitle: 'رجوع' }} />

      <ScrollView contentContainerClassName="px-5 py-4 pb-28">
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
              <>
                <View className="mb-5 rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                  <View className="mb-4 flex-row-reverse items-center justify-between">
                    <Text className="text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                      {editingUser ? 'تعديل المستخدم' : 'إنشاء مستخدم جديد'}
                    </Text>
                    {editingUser ? (
                      <Pressable
                        onPress={resetForm}
                        accessibilityRole="button"
                        accessibilityLabel="إلغاء التعديل"
                        className="h-9 w-9 items-center justify-center rounded-full border border-border dark:border-border-dark"
                      >
                        <AppIcon name="close-circle" size={18} color="#7A6A5F" />
                      </Pressable>
                    ) : null}
                  </View>

                  <AppTextInput label="الاسم" value={displayName} onChangeText={setDisplayName} />
                  <AppTextInput
                    label="البريد الإلكتروني"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    editable={!editingUser}
                    keyboardType="email-address"
                  />
                  {!editingUser ? (
                    <AppTextInput
                      label="كلمة المرور"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  ) : null}
                  <ChipSelector
                    label="الصلاحية"
                    options={ROLE_OPTIONS.map((item) => ROLE_LABELS[item])}
                    value={ROLE_LABELS[role]}
                    onChange={selectRole}
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
                                  className={`text-center font-cairo-medium text-sm ${
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
                  <PrimaryButton
                    label={editingUser ? 'حفظ التعديلات' : 'إنشاء المستخدم'}
                    onPress={handleSave}
                    loading={saving}
                  />
                </View>

                <View className="rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                  <Text className="mb-4 text-right font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                    المستخدمون الحاليون
                  </Text>
                  {managedUsers.length === 0 ? (
                    <Text className="text-center font-cairo text-sm text-text-secondary dark:text-text-secondary-dark">
                      لا توجد حسابات محفوظة.
                    </Text>
                  ) : (
                    managedUsers.map((target) => {
                      const isCurrentUser = target.uid === user.uid;
                      return (
                        <View
                          key={target.uid}
                          className="mb-2 flex-row-reverse items-center justify-between rounded-xl border border-border bg-background p-3 dark:border-border-dark dark:bg-background-dark"
                        >
                          <View className="flex-1">
                            <Text className="text-right font-cairo-semibold text-sm text-text-primary dark:text-text-primary-dark">
                              {target.displayName || 'بدون اسم'}
                            </Text>
                            <Text className="mt-0.5 text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                              {target.email}
                            </Text>
                            <Text className="mt-1 text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                              {ROLE_LABELS[target.role]} - {branchSummary(target)}
                            </Text>
                            {isCurrentUser ? (
                              <Text className="mt-1 text-right font-cairo text-xs text-success dark:text-success-dark">
                                الحساب الحالي
                              </Text>
                            ) : null}
                          </View>
                          <View className="mr-3 flex-row-reverse gap-2">
                            <Pressable
                              onPress={() => startEdit(target)}
                              disabled={isCurrentUser}
                              accessibilityRole="button"
                              accessibilityLabel={`تعديل ${target.displayName ?? target.email}`}
                              className={`h-10 w-10 items-center justify-center rounded-full border border-border dark:border-border-dark ${
                                isCurrentUser ? 'opacity-40' : ''
                              }`}
                            >
                              <AppIcon name="edit" size={18} color="#7A6A5F" />
                            </Pressable>
                            <Pressable
                              onPress={() => handleDelete(target)}
                              disabled={isCurrentUser || saving}
                              accessibilityRole="button"
                              accessibilityLabel={`حذف ${target.displayName ?? target.email}`}
                              className={`h-10 w-10 items-center justify-center rounded-full border border-danger dark:border-danger-dark ${
                                isCurrentUser ? 'opacity-40' : ''
                              }`}
                            >
                              <AppIcon name="trash" size={18} color="#B3261E" />
                            </Pressable>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </>
            ) : (
              <EmptyState title="صلاحية محدودة" description="إدارة المستخدمين متاحة للمالك فقط." />
            )}
          </>
        ) : (
          <EmptyState title="لا يوجد مستخدم نشط" description="سجل الدخول لعرض بيانات المستخدم." />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
