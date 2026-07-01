import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/src/components/AppIcon';
import { BranchSwitcher } from '@/src/components/BranchSwitcher';
import { EmptyState } from '@/src/components/EmptyState';
import { RevenueForm, type RevenueFormValues } from '@/src/components/RevenueForm';
import {
  createRevenue,
  deleteRevenue,
  updateRevenue,
} from '@/src/features/revenue/service';
import type { Revenue } from '@/src/features/revenue/types';
import { useBranches } from '@/src/hooks/useBranches';
import { useProducts } from '@/src/hooks/useProducts';
import { useRevenuesForRange } from '@/src/hooks/useRevenuesForRange';
import { useAuthStore } from '@/src/store/auth';
import { useBranchStore } from '@/src/store/branch';
import { confirmAction } from '@/src/utils/confirmAction';
import { formatAmount } from '@/src/utils/currency';
import { toDateKey } from '@/src/utils/date';

function emptyFormValues(defaultBranchId: string): RevenueFormValues {
  return {
    branchId: defaultBranchId,
    productId: '',
    productName: '',
    quantity: '1',
    unitPrice: '',
    note: '',
  };
}

export default function RevenueScreen() {
  const { branches } = useBranches();
  const { products } = useProducts();
  const uid = useAuthStore((state) => state.user?.uid ?? '');
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const [viewDate, setViewDate] = useState(new Date());
  const dateKey = toDateKey(viewDate);
  const { revenues, loading } = useRevenuesForRange(dateKey, dateKey);

  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [saving, setSaving] = useState(false);

  const visibleRevenues =
    selectedBranchId === 'all'
      ? revenues
      : revenues.filter((revenue) => revenue.branchId === selectedBranchId);

  const dayTotal = visibleRevenues.reduce((sum, revenue) => sum + revenue.total, 0);

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

  async function handleAdd(values: RevenueFormValues) {
    setSaving(true);
    try {
      await createRevenue(values.branchId, {
        productId: values.productId,
        productName: values.productName,
        quantity: Number(values.quantity),
        unitPrice: Number(values.unitPrice),
        timestamp: buildTimestamp(),
        note: values.note.trim() || undefined,
        createdBy: uid,
      });
      setMode('list');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(values: RevenueFormValues) {
    if (!editingRevenue) return;
    setSaving(true);
    try {
      await updateRevenue(values.branchId, editingRevenue.id, {
        productId: values.productId,
        productName: values.productName,
        quantity: Number(values.quantity),
        unitPrice: Number(values.unitPrice),
        timestamp: editingRevenue.timestamp,
        note: values.note.trim() || undefined,
      });
      setMode('list');
      setEditingRevenue(null);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!editingRevenue) return;
    confirmAction('حذف الإيراد', 'هل أنت متأكد من حذف هذا الإيراد؟', async () => {
      if (!editingRevenue) return;
      setSaving(true);
      try {
            await deleteRevenue(editingRevenue.branchId, editingRevenue.id, uid);
        setMode('list');
        setEditingRevenue(null);
      } finally {
        setSaving(false);
      }
    });
  }

  const defaultBranchId =
    selectedBranchId !== 'all' ? selectedBranchId : (branches[0]?.id ?? '');

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <View className="flex-row-reverse items-center justify-between px-5 py-4">
        <Text className="font-cairo-bold text-xl text-text-primary dark:text-text-primary-dark">
          الإيرادات
        </Text>
        {mode === 'list' ? (
          <Pressable
            onPress={() => {
              setEditingRevenue(null);
              setMode('add');
            }}
            accessibilityRole="button"
            accessibilityLabel="إضافة إيراد"
            className="h-10 w-10 items-center justify-center rounded-full bg-primary dark:bg-primary-dark"
          >
            <AppIcon name="add" size={22} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>

      {mode === 'list' ? (
        <>
          <BranchSwitcher />

          <View className="flex-row-reverse items-center justify-between px-5 pb-3">
            <Pressable onPress={() => changeDay(-1)} accessibilityLabel="اليوم السابق">
              <AppIcon name="chevron-right" size={22} color="#7A6A5F" />
            </Pressable>
            <Text className="font-cairo-medium text-sm text-text-primary dark:text-text-primary-dark">
              {dateKey}
            </Text>
            <Pressable onPress={() => changeDay(1)} accessibilityLabel="اليوم التالي">
              <AppIcon name="chevron-left" size={22} color="#7A6A5F" />
            </Pressable>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#D64535" size="large" />
            </View>
          ) : visibleRevenues.length === 0 ? (
            <EmptyState title="لا توجد إيرادات مسجّلة" description="اضغط + لإضافة أول إيراد لهذا اليوم" />
          ) : (
            <ScrollView contentContainerClassName="px-5 pb-8">
              {visibleRevenues.map((revenue) => {
                const branch = branches.find((item) => item.id === revenue.branchId);
                return (
                  <Pressable
                    key={revenue.id}
                    onPress={() => {
                      setEditingRevenue(revenue);
                      setMode('edit');
                    }}
                    className="mb-2 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
                  >
                    <View>
                      <Text className="font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
                        {revenue.productName}
                      </Text>
                      <Text className="text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                        {revenue.quantity} × {formatAmount(revenue.unitPrice)}
                        {selectedBranchId === 'all' && branch ? ` · ${branch.name}` : ''}
                      </Text>
                    </View>
                    <Text className="font-cairo-semibold text-sm text-success dark:text-success-dark">
                      {formatAmount(revenue.total)}
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
          <RevenueForm
            branches={branches}
            products={products}
            initialValues={
              mode === 'edit' && editingRevenue
                ? {
                    branchId: editingRevenue.branchId,
                    productId: editingRevenue.productId,
                    productName: editingRevenue.productName,
                    quantity: String(editingRevenue.quantity),
                    unitPrice: String(editingRevenue.unitPrice),
                    note: editingRevenue.note ?? '',
                  }
                : emptyFormValues(defaultBranchId)
            }
            submitLabel={mode === 'edit' ? 'حفظ التعديلات' : 'إضافة الإيراد'}
            saving={saving}
            onSubmit={mode === 'edit' ? handleEdit : handleAdd}
            onCancel={() => {
              setMode('list');
              setEditingRevenue(null);
            }}
            onDelete={mode === 'edit' ? confirmDelete : undefined}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
