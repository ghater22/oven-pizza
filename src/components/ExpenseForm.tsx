import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppIcon } from '@/src/components/AppIcon';
import { pickAndUploadReceipt } from '@/src/features/attachments/service';
import type { Branch } from '@/src/features/branches/types';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/src/features/expenses/types';
import { confirmSaveAction } from '@/src/utils/confirmAction';
import { formatAmount } from '@/src/utils/currency';

import { AppTextInput } from './AppTextInput';
import { PrimaryButton } from './PrimaryButton';

export interface ExpenseFormValues {
  branchId: string;
  category: ExpenseCategory;
  amount: string;
  note: string;
  receiptName?: string;
  receiptPath?: string;
  receiptUrl?: string;
}

interface ExpenseFormProps {
  branches: Branch[];
  initialValues: ExpenseFormValues;
  submitLabel: string;
  saving: boolean;
  userId: string;
  onSubmit: (values: ExpenseFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function ExpenseForm({
  branches,
  initialValues,
  submitLabel,
  saving,
  userId,
  onSubmit,
  onCancel,
  onDelete,
}: ExpenseFormProps) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const selectedBranch = branches.find((branch) => branch.id === values.branchId);
  const amountValue = Number(values.amount) || 0;

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
    confirmSaveAction(
      'مراجعة المصروف قبل الاعتماد',
      [
        `الفرع: ${selectedBranch?.name ?? values.branchId}`,
        `التصنيف: ${values.category}`,
        `المبلغ: ${formatAmount(amount)}`,
        `الملاحظة: ${values.note.trim() || 'لا توجد'}`,
        `الفاتورة: ${values.receiptName ? 'مرفقة' : 'غير مرفقة'}`,
      ].join('\n'),
      () => onSubmit(values)
    );
  }

  async function handlePickReceipt() {
    if (!values.branchId) {
      setError('الرجاء اختيار الفرع قبل رفع الفاتورة');
      return;
    }

    setUploadingReceipt(true);
    setError(null);
    try {
      const receipt = await pickAndUploadReceipt({
        branchId: values.branchId,
        recordType: 'expenses',
        userId,
      });
      if (receipt) {
        setValues((prev) => ({ ...prev, ...receipt }));
      }
    } catch {
      setError('تعذر رفع صورة الفاتورة، حاول مرة أخرى');
    } finally {
      setUploadingReceipt(false);
    }
  }

  return (
    <View>
      <Text className="mb-1.5 font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
        الفرع
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 max-h-14" contentContainerClassName="h-12 items-center gap-2">
        {branches.map((branch) => {
          const active = branch.id === values.branchId;
          return (
            <Pressable
              key={branch.id}
              onPress={() => setValues((prev) => ({ ...prev, branchId: branch.id }))}
              className={`h-11 min-w-28 items-center justify-center rounded-xl px-4 ${
                active
                  ? 'bg-primary dark:bg-primary-dark'
                  : 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
              }`}
            >
              <Text
                numberOfLines={1}
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 max-h-14" contentContainerClassName="h-12 items-center gap-2">
        {EXPENSE_CATEGORIES.map((category) => {
          const active = category === values.category;
          return (
            <Pressable
              key={category}
              onPress={() => setValues((prev) => ({ ...prev, category }))}
              className={`h-11 min-w-28 items-center justify-center rounded-xl px-4 ${
                active
                  ? 'bg-primary dark:bg-primary-dark'
                  : 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
              }`}
            >
              <Text
                numberOfLines={1}
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

      <Pressable
        onPress={handlePickReceipt}
        disabled={saving || uploadingReceipt}
        accessibilityRole="button"
        accessibilityLabel="رفع صورة فاتورة"
        className="mb-3 flex-row-reverse items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark"
      >
        <AppIcon name="image" size={20} color={values.receiptUrl ? '#4E9F6E' : '#7A6A5F'} />
        <Text className="font-cairo-semibold text-sm text-text-primary dark:text-text-primary-dark">
          {uploadingReceipt ? 'جاري رفع الفاتورة...' : values.receiptUrl ? 'تم رفع صورة الفاتورة' : 'رفع صورة فاتورة'}
        </Text>
      </Pressable>

      {values.receiptName ? (
        <Text className="mb-3 text-center font-cairo text-xs text-success dark:text-success-dark">
          {values.receiptName}
        </Text>
      ) : null}

      <View className="mb-3 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
        <View className="mb-3 flex-row-reverse items-center gap-2">
          <AppIcon name="check-circle" size={19} color="#3E8E4F" />
          <Text className="font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
            مراجعة قبل الاعتماد
          </Text>
        </View>
        <ReviewRow label="الفرع" value={selectedBranch?.name || 'لم يتم اختيار الفرع'} />
        <ReviewRow label="التصنيف" value={values.category} />
        <ReviewRow label="المبلغ" value={amountValue > 0 ? formatAmount(amountValue) : '0'} strong />
        <ReviewRow label="الملاحظة" value={values.note.trim() || 'لا توجد'} />
        <ReviewRow label="صورة الفاتورة" value={values.receiptName ? 'مرفقة' : 'غير مرفقة'} />
      </View>

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

function ReviewRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View className="mt-2 flex-row-reverse items-center justify-between gap-3">
      <Text className="font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">{label}</Text>
      <Text
        numberOfLines={1}
        className={`flex-1 text-left font-cairo text-sm text-text-primary dark:text-text-primary-dark ${
          strong ? 'font-cairo-bold text-danger dark:text-danger-dark' : ''
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
