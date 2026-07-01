import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { Branch } from '@/src/features/branches/types';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/src/features/expenses/types';

import { AppTextInput } from './AppTextInput';
import { PrimaryButton } from './PrimaryButton';

export interface ExpenseFormValues {
  branchId: string;
  category: ExpenseCategory;
  amount: string;
  note: string;
}

interface ExpenseFormProps {
  branches: Branch[];
  initialValues: ExpenseFormValues;
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: ExpenseFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function ExpenseForm({
  branches,
  initialValues,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
  onDelete,
}: ExpenseFormProps) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const amount = Number(values.amount);

    if (!values.branchId) {
      setError('الرجاء اختيار الفرع');
      return;
    }
    if (!amount || amount <= 0) {
      setError('الرجاء إدخال مبلغ صحيح');
      return;
    }

    setError(null);
    onSubmit(values);
  }

  return (
    <View>
      <Text className="mb-1.5 font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
        الفرع
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 mb-4">
        {branches.map((branch) => {
          const active = branch.id === values.branchId;
          return (
            <Pressable
              key={branch.id}
              onPress={() => setValues((prev) => ({ ...prev, branchId: branch.id }))}
              className={`rounded-full px-4 py-2 ${
                active
                  ? 'bg-primary dark:bg-primary-dark'
                  : 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
              }`}
            >
              <Text
                className={`font-cairo-medium text-sm ${active ? 'text-white' : 'text-text-secondary dark:text-text-secondary-dark'}`}
              >
                {branch.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text className="mb-1.5 font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
        التصنيف
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 mb-4">
        {EXPENSE_CATEGORIES.map((category) => {
          const active = category === values.category;
          return (
            <Pressable
              key={category}
              onPress={() => setValues((prev) => ({ ...prev, category }))}
              className={`rounded-full px-4 py-2 ${
                active
                  ? 'bg-primary dark:bg-primary-dark'
                  : 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
              }`}
            >
              <Text
                className={`font-cairo-medium text-sm ${active ? 'text-white' : 'text-text-secondary dark:text-text-secondary-dark'}`}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <AppTextInput
        label="المبلغ"
        value={values.amount}
        onChangeText={(text) => setValues((prev) => ({ ...prev, amount: text }))}
        keyboardType="numeric"
      />
      <AppTextInput
        label="ملاحظة (اختياري)"
        value={values.note}
        onChangeText={(text) => setValues((prev) => ({ ...prev, note: text }))}
      />

      {error ? (
        <Text className="mb-3 text-center font-cairo text-sm text-danger dark:text-danger-dark">
          {error}
        </Text>
      ) : null}

      <PrimaryButton label={submitLabel} onPress={handleSubmit} loading={saving} />
      <View className="mt-3 flex-row-reverse gap-3">
        <View className="flex-1">
          <PrimaryButton label="إلغاء" onPress={onCancel} variant="secondary" />
        </View>
        {onDelete ? (
          <View className="flex-1">
            <PrimaryButton label="حذف" onPress={onDelete} variant="secondary" />
          </View>
        ) : null}
      </View>
    </View>
  );
}
