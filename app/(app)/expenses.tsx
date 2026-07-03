import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountantProfileBar } from '@/src/components/AccountantProfileBar';
import { AppIcon } from '@/src/components/AppIcon';
import { BranchSwitcher } from '@/src/components/BranchSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { ExpenseForm, type ExpenseFormValues } from '@/src/components/ExpenseForm';
import {
  createExpense,
  deleteExpense,
  updateExpense,
} from '@/src/features/expenses/service';
import { EXPENSE_CATEGORIES, type Expense } from '@/src/features/expenses/types';
import { useBranches } from '@/src/hooks/useBranches';
import { useExpensesForRange } from '@/src/hooks/useExpensesForRange';
import { useAuthStore } from '@/src/store/auth';
import { useBranchStore } from '@/src/store/branch';
import { confirmAction } from '@/src/utils/confirmAction';
import { formatAmount } from '@/src/utils/currency';
import { toDateKey } from '@/src/utils/date';

function emptyFormValues(defaultBranchId: string): ExpenseFormValues {
  return {
    branchId: defaultBranchId,
    category: EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1],
    amount: '',
    note: '',
    receiptName: undefined,
    receiptPath: undefined,
    receiptUrl: undefined,
  };
}

function formatEntryDateLabel(date: Date) {
  return `${toDateKey(date)} - ${date.toLocaleDateString('ar-SA', { weekday: 'long' })}`;
}

export default function ExpensesScreen() {
  const { branches } = useBranches();
  const uid = useAuthStore((state) => state.user?.uid ?? '');
  const isAccountant = useAuthStore((state) => state.profile?.role === 'accountant');
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const [viewDate, setViewDate] = useState(new Date());
  const dateKey = toDateKey(viewDate);
  const { expenses, loading } = useExpensesForRange(dateKey, dateKey);

  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  const visibleExpenses =
    selectedBranchId === 'all'
      ? expenses
      : expenses.filter((expense) => expense.branchId === selectedBranchId);

  const dayTotal = visibleExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  function changeDay(offsetDays: number) {
    const next = new Date(viewDate);
    next.setDate(next.getDate() + offsetDays);
    setViewDate(next);
  }

  function buildTimestamp(): Date {
    const now = new Date();
    const combined = new Date(viewDate);
    combined.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    return combined;
  }

  async function handleAdd(values: ExpenseFormValues) {
    setSaving(true);
    try {
      await createExpense(values.branchId, {
        category: values.category,
        amount: Number(values.amount),
        timestamp: buildTimestamp(),
        note: values.note.trim() || undefined,
        createdBy: uid,
        receiptName: values.receiptName,
        receiptPath: values.receiptPath,
        receiptUrl: values.receiptUrl,
      });
      setMode('list');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(values: ExpenseFormValues) {
    if (!editingExpense) return;
    setSaving(true);
    try {
      await updateExpense(values.branchId, editingExpense.id, {
        category: values.category,
        amount: Number(values.amount),
        timestamp: editingExpense.timestamp,
        note: values.note.trim() || undefined,
        receiptName: values.receiptName,
        receiptPath: values.receiptPath,
        receiptUrl: values.receiptUrl,
      });
      setMode('list');
      setEditingExpense(null);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!editingExpense) return;
    confirmAction('حذف المصروف', 'هل أنت متأكد من حذف هذا المصروف؟', async () => {
      if (!editingExpense) return;
      setSaving(true);
      try {
        await deleteExpense(editingExpense.branchId, editingExpense.id, uid);
        setMode('list');
        setEditingExpense(null);
      } finally {
        setSaving(false);
      }
    });
  }

  const defaultBranchId =
    selectedBranchId !== 'all' && branches.some((branch) => branch.id === selectedBranchId)
      ? selectedBranchId
      : (branches[0]?.id ?? '');

  const formDate = editingExpense?.timestamp ?? viewDate;
  const entryDateLabel = formatEntryDateLabel(formDate);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <View className="flex-row-reverse items-center justify-between px-5 py-4">
        <Text className="font-cairo-bold text-xl text-text-primary dark:text-text-primary-dark">
          المصروفات
        </Text>
        {mode === 'list' ? (
          <Pressable
            onPress={() => {
              setEditingExpense(null);
              setMode('add');
            }}
            accessibilityRole="button"
            accessibilityLabel="إضافة مصروف"
            className="h-10 w-10 items-center justify-center rounded-full bg-primary dark:bg-primary-dark"
          >
            <AppIcon name="add" size={22} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>

      {isAccountant ? <AccountantProfileBar /> : null}

      {mode === 'list' ? (
        <>
          <BranchSwitcher />

          <View className="flex-row-reverse items-center justify-between px-5 pb-3">
            <Pressable onPress={() => changeDay(-1)} accessibilityLabel="اليوم السابق">
              <AppIcon name="chevron-right" size={22} color="#7A6A5F" />
            </Pressable>
            <Text className="font-cairo-medium text-sm text-text-primary dark:text-text-primary-dark">
              {formatEntryDateLabel(viewDate)}
            </Text>
            <Pressable onPress={() => changeDay(1)} accessibilityLabel="اليوم التالي">
              <AppIcon name="chevron-left" size={22} color="#7A6A5F" />
            </Pressable>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#D64535" size="large" />
            </View>
          ) : visibleExpenses.length === 0 ? (
            <EmptyState title="لا توجد مصروفات مسجّلة" description="اضغط + لإضافة أول مصروف لهذا اليوم" />
          ) : (
            <ScrollView contentContainerClassName="px-5 pb-8">
              {visibleExpenses.map((expense) => {
                const branch = branches.find((item) => item.id === expense.branchId);
                return (
                  <Pressable
                    key={expense.id}
                    onPress={() => {
                      setEditingExpense(expense);
                      setMode('edit');
                    }}
                    className="mb-2 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
                  >
                    <View>
                      <Text className="font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
                        {expense.category}
                      </Text>
                      {selectedBranchId === 'all' && branch ? (
                        <Text className="text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                          {branch.name}
                        </Text>
                      ) : null}
                    </View>
                    <Text className="font-cairo-semibold text-sm text-danger dark:text-danger-dark">
                      {formatAmount(expense.amount)}
                    </Text>
                  </Pressable>
                );
              })}
              <View className="mt-2 flex-row-reverse items-center justify-between px-1">
                <Text className="font-cairo-semibold text-sm text-text-secondary dark:text-text-secondary-dark">
                  الإجمالي
                </Text>
                <Text className="font-cairo-bold text-base text-text-primary dark:text-text-primary-dark">
                  {formatAmount(dayTotal)}
                </Text>
              </View>
            </ScrollView>
          )}
        </>
      ) : (
        <ScrollView contentContainerClassName="px-5 py-4">
          <ExpenseForm
            branches={branches}
            entryDateLabel={entryDateLabel}
            initialValues={
              mode === 'edit' && editingExpense
                ? {
                    branchId: editingExpense.branchId,
                    category: editingExpense.category,
                    amount: String(editingExpense.amount),
                    note: editingExpense.note ?? '',
                    receiptName: editingExpense.receiptName,
                    receiptPath: editingExpense.receiptPath,
                    receiptUrl: editingExpense.receiptUrl,
                  }
                : emptyFormValues(defaultBranchId)
            }
            submitLabel={mode === 'edit' ? 'حفظ التعديلات' : 'إضافة المصروف'}
            saving={saving}
            userId={uid}
            onSubmit={mode === 'edit' ? handleEdit : handleAdd}
            onCancel={() => {
              setMode('list');
              setEditingExpense(null);
            }}
            onDelete={mode === 'edit' ? confirmDelete : undefined}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
