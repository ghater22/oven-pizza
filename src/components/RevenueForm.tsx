import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { Branch } from '@/src/features/branches/types';
import type { Product } from '@/src/features/products/types';

import { AppTextInput } from './AppTextInput';
import { PrimaryButton } from './PrimaryButton';

export interface RevenueFormValues {
  branchId: string;
  productId: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  note: string;
}

interface RevenueFormProps {
  branches: Branch[];
  products: Product[];
  initialValues: RevenueFormValues;
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: RevenueFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function RevenueForm({
  branches,
  products,
  initialValues,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
  onDelete,
}: RevenueFormProps) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);

  function selectProduct(product: Product) {
    setValues((prev) => ({
      ...prev,
      productId: product.id,
      productName: product.name,
      unitPrice: String(product.price),
    }));
  }

  function handleSubmit() {
    const quantity = Number(values.quantity);
    const unitPrice = Number(values.unitPrice);

    if (!values.branchId) {
      setError('الرجاء اختيار الفرع');
      return;
    }
    if (!values.productId) {
      setError('الرجاء اختيار المنتج');
      return;
    }
    if (!quantity || quantity <= 0) {
      setError('الرجاء إدخال كمية صحيحة');
      return;
    }
    if (!unitPrice || unitPrice <= 0) {
      setError('الرجاء إدخال سعر صحيح');
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
        المنتج
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 mb-4">
        {products.map((product) => {
          const active = product.id === values.productId;
          return (
            <Pressable
              key={product.id}
              onPress={() => selectProduct(product)}
              className={`rounded-full px-4 py-2 ${
                active
                  ? 'bg-primary dark:bg-primary-dark'
                  : 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
              }`}
            >
              <Text
                className={`font-cairo-medium text-sm ${active ? 'text-white' : 'text-text-secondary dark:text-text-secondary-dark'}`}
              >
                {product.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="flex-row-reverse gap-3">
        <View className="flex-1">
          <AppTextInput
            label="الكمية"
            value={values.quantity}
            onChangeText={(text) => setValues((prev) => ({ ...prev, quantity: text }))}
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <AppTextInput
            label="سعر الوحدة"
            value={values.unitPrice}
            onChangeText={(text) => setValues((prev) => ({ ...prev, unitPrice: text }))}
            keyboardType="numeric"
          />
        </View>
      </View>

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
