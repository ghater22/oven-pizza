import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/src/components/AppIcon';
import { AppTextInput } from '@/src/components/AppTextInput';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { createBranch, deleteBranch, renameBranch } from '@/src/features/branches/service';
import { useBranches } from '@/src/hooks/useBranches';
import { confirmAction } from '@/src/utils/confirmAction';

export default function BranchesScreen() {
  const { branches, loading } = useBranches();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [saving, setSaving] = useState(false);

  function startEditing(branchId: string, currentName: string) {
    setEditingId(branchId);
    setEditName(currentName);
  }

  async function saveEditing() {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    try {
      await renameBranch(editingId, editName.trim());
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddBranch() {
    if (!newBranchName.trim()) return;
    setSaving(true);
    try {
      const nextOrder = branches.reduce((max, branch) => Math.max(max, branch.order), 0) + 1;
      await createBranch(newBranchName.trim(), nextOrder);
      setNewBranchName('');
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteBranch(branchId: string, name: string) {
    confirmAction('حذف الفرع', `هل تريد حذف فرع ${name}؟ ستبقى السجلات السابقة محفوظة.`, async () => {
      setSaving(true);
      try {
        await deleteBranch(branchId);
      } finally {
        setSaving(false);
      }
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: 'إدارة الفروع', headerBackTitle: 'رجوع' }} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#D64535" size="large" />
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 py-4">
          {branches.map((branch) => (
            <View
              key={branch.id}
              className="mb-2 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
            >
              {editingId === branch.id ? (
                <View className="flex-1 flex-row-reverse items-center gap-2">
                  <View className="flex-1">
                    <AppTextInput label="" value={editName} onChangeText={setEditName} />
                  </View>
                  <Pressable onPress={saveEditing} accessibilityRole="button" accessibilityLabel="حفظ">
                    <AppIcon name="check-circle" size={26} color="#3E8E4F" />
                  </Pressable>
                  <Pressable
                    onPress={() => setEditingId(null)}
                    accessibilityRole="button"
                    accessibilityLabel="إلغاء"
                  >
                    <AppIcon name="close-circle" size={26} color="#B3261E" />
                  </Pressable>
                </View>
              ) : (
                <>
                  <Text className="font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
                    {branch.name}
                  </Text>
                  <View className="flex-row-reverse items-center gap-3">
                    <Pressable
                      onPress={() => startEditing(branch.id, branch.name)}
                      accessibilityRole="button"
                      accessibilityLabel={`تعديل ${branch.name}`}
                    >
                      <AppIcon name="edit" size={20} color="#7A6A5F" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteBranch(branch.id, branch.name)}
                      accessibilityRole="button"
                      accessibilityLabel={`حذف ${branch.name}`}
                    >
                      <AppIcon name="trash" size={20} color="#B3261E" />
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          ))}

          <View className="mt-6">
            <AppTextInput
              label="اسم فرع جديد"
              value={newBranchName}
              onChangeText={setNewBranchName}
              placeholder="مثال: الفرع الثالث"
            />
            <PrimaryButton label="إضافة فرع" onPress={handleAddBranch} loading={saving} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
