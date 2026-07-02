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
import { AccountantProfileBar } from '@/src/components/AccountantProfileBar';
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
import { confirmAction, confirmSaveAction } from '@/src/utils/confirmAction';
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
    receiptName: undefined,
    receiptPath: undefined,
    receiptUrl: undefined,
  };
}

export default function RevenueScreen() {
  const { branches } = useBranches();
  const { products } = useProducts();
  const uid = useAuthStore((state) => state.user?.uid ?? '');
  const role = useAuthStore((state) => state.profile?.role);
  const isAccountant = role === 'accountant';
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const [viewDate, setViewDate] = useState(new Date());
  const dateKey = toDateKey(viewDate);
  const { revenues, loading } = useRevenuesForRange(dateKey, dateKey, !isAccountant);

  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [saving, setSaving] = useState(false);
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [selectedQuickProductId, setSelectedQuickProductId] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);

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
        receiptName: values.receiptName,
        receiptPath: values.receiptPath,
        receiptUrl: values.receiptUrl,
      });
      setFormVersion((value) => value + 1);
      setMode('list');
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickSale(productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product || !defaultBranchId) return;
    const branch = branches.find((item) => item.id === defaultBranchId);
    setSelectedQuickProductId(product.id);

    confirmSaveAction(
      'مراجعة البيع السريع',
      [
        `الفرع: ${branch?.name ?? defaultBranchId}`,
        `المنتج: ${product.name}`,
        `الكمية: ${quickQuantity}`,
        `سعر الوحدة: ${formatAmount(product.price)}`,
        `الإجمالي: ${formatAmount(quickQuantity * product.price)}`,
      ].join('\n'),
      async () => {
        setSaving(true);
        try {
          await createRevenue(defaultBranchId, {
            productId: product.id,
            productName: product.name,
            quantity: quickQuantity,
            unitPrice: product.price,
            timestamp: buildTimestamp(),
            createdBy: uid,
          });
        } finally {
          setSaving(false);
          setSelectedQuickProductId(null);
        }
      },
      () => setSelectedQuickProductId(null)
    );
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
        receiptName: values.receiptName,
        receiptPath: values.receiptPath,
        receiptUrl: values.receiptUrl,
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
    selectedBranchId !== 'all' && branches.some((branch) => branch.id === selectedBranchId)
      ? selectedBranchId
      : (branches[0]?.id ?? '');

  if (isAccountant) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
        <View className="px-5 py-4">
          <Text className="text-right font-cairo-bold text-xl text-text-primary dark:text-text-primary-dark">
            إدخال الإيرادات
          </Text>
        </View>
        <AccountantProfileBar />
        <ScrollView contentContainerClassName="px-5 pb-28 pt-2">
          {products.length > 0 && defaultBranchId ? (
            <View className="mb-4 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
              <View className="mb-3 flex-row-reverse items-center justify-between">
                <View className="flex-row-reverse items-center gap-2">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary/20 dark:bg-secondary-dark/20">
                    <AppIcon name="zap" size={19} color="#D64535" />
                  </View>
                  <Text className="font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                    البيع السريع
                  </Text>
                </View>
                <View className="flex-row-reverse items-center gap-2">
                  <Pressable
                    onPress={() => setQuickQuantity((value) => Math.max(1, value - 1))}
                    accessibilityRole="button"
                    accessibilityLabel="تقليل الكمية"
                    className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-background dark:border-border-dark dark:bg-background-dark"
                  >
                    <Text className="font-cairo-bold text-lg text-text-primary dark:text-text-primary-dark">-</Text>
                  </Pressable>
                  <Text className="w-8 text-center font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                    {quickQuantity}
                  </Text>
                  <Pressable
                    onPress={() => setQuickQuantity((value) => value + 1)}
                    accessibilityRole="button"
                    accessibilityLabel="زيادة الكمية"
                    className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-background dark:border-border-dark dark:bg-background-dark"
                  >
                    <Text className="font-cairo-bold text-lg text-text-primary dark:text-text-primary-dark">+</Text>
                  </Pressable>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="max-h-16"
                contentContainerClassName="h-14 items-center gap-2"
              >
                {products.map((product) => {
                  const selected = selectedQuickProductId === product.id;
                  return (
                    <Pressable
                      key={product.id}
                      onPress={() => handleQuickSale(product.id)}
                      disabled={saving}
                      accessibilityRole="button"
                      accessibilityLabel={`بيع سريع ${product.name}`}
                      className={`h-12 min-w-32 flex-row-reverse items-center justify-center gap-2 rounded-xl px-4 ${
                        selected ? 'bg-primary dark:bg-primary-dark' : 'bg-secondary dark:bg-secondary-dark'
                      }`}
                    >
                      {selected ? <AppIcon name="check-circle" size={15} color="#FFFFFF" /> : null}
                      <Text
                        numberOfLines={1}
                        className={`font-cairo-semibold text-sm ${selected ? 'text-white' : 'text-text-primary'}`}
                      >
                        {product.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View className="mb-4 flex-row-reverse items-center gap-2 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
              <AppIcon name="zap" size={19} color="#D64535" />
              <Text className="flex-1 text-right font-cairo text-sm text-text-secondary dark:text-text-secondary-dark">
                أضف المنتجات من حساب المالك لتظهر هنا كأزرار بيع سريع للمحاسب.
              </Text>
            </View>
          )}
          <RevenueForm
            key={formVersion}
            branches={branches}
            products={products}
            initialValues={emptyFormValues(defaultBranchId)}
            submitLabel="حفظ الإيراد اليومي"
            saving={saving}
            userId={uid}
            onSubmit={handleAdd}
            onCancel={() => setFormVersion((value) => value + 1)}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

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

          {products.length > 0 && defaultBranchId ? (
            <View className="px-5 pb-4">
              <View className="mb-2 flex-row-reverse items-center justify-between">
                <Text className="font-cairo-semibold text-sm text-text-primary dark:text-text-primary-dark">
                  بيع سريع
                </Text>
                <View className="flex-row-reverse items-center gap-2">
                  <Pressable
                    onPress={() => setQuickQuantity((value) => Math.max(1, value - 1))}
                    accessibilityRole="button"
                    accessibilityLabel="تقليل الكمية"
                    className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark"
                  >
                    <Text className="font-cairo-bold text-lg text-text-primary dark:text-text-primary-dark">-</Text>
                  </Pressable>
                  <Text className="w-8 text-center font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
                    {quickQuantity}
                  </Text>
                  <Pressable
                    onPress={() => setQuickQuantity((value) => value + 1)}
                    accessibilityRole="button"
                    accessibilityLabel="زيادة الكمية"
                    className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark"
                  >
                    <Text className="font-cairo-bold text-lg text-text-primary dark:text-text-primary-dark">+</Text>
                  </Pressable>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-16" contentContainerClassName="h-14 items-center gap-2">
                {products.map((product) => {
                  const selected = selectedQuickProductId === product.id;
                  return (
                    <Pressable
                      key={product.id}
                      onPress={() => handleQuickSale(product.id)}
                      disabled={saving}
                      accessibilityRole="button"
                      accessibilityLabel={`بيع سريع ${product.name}`}
                      className={`h-12 min-w-32 flex-row-reverse items-center justify-center gap-2 rounded-xl px-4 ${
                        selected ? 'bg-primary dark:bg-primary-dark' : 'bg-secondary dark:bg-secondary-dark'
                      }`}
                    >
                      {selected ? <AppIcon name="check-circle" size={15} color="#FFFFFF" /> : null}
                      <Text
                        numberOfLines={1}
                        className={`font-cairo-semibold text-sm ${selected ? 'text-white' : 'text-text-primary'}`}
                      >
                        {product.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View className="px-5 pb-4">
              <View className="rounded-xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                <Text className="text-right font-cairo-semibold text-sm text-text-primary dark:text-text-primary-dark">
                  البيع السريع
                </Text>
                <Text className="mt-1 text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                  أضف منتجات من الإعدادات لتظهر هنا كأزرار بيع جاهزة بالسعر والكمية.
                </Text>
              </View>
            </View>
          )}

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
                    receiptName: editingRevenue.receiptName,
                    receiptPath: editingRevenue.receiptPath,
                    receiptUrl: editingRevenue.receiptUrl,
                  }
                : emptyFormValues(defaultBranchId)
            }
            submitLabel={mode === 'edit' ? 'حفظ التعديلات' : 'إضافة الإيراد'}
            saving={saving}
            userId={uid}
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
