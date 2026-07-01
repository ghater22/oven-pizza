import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/src/components/AppIcon';
import { AppTextInput } from '@/src/components/AppTextInput';
import { ChipSelector } from '@/src/components/ChipSelector';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { createProduct, deleteProduct, updateProduct } from '@/src/features/products/service';
import { PRODUCT_CATEGORIES, type Product } from '@/src/features/products/types';
import { useProducts } from '@/src/hooks/useProducts';
import { useAuthStore } from '@/src/store/auth';
import { confirmAction } from '@/src/utils/confirmAction';
import { formatAmount } from '@/src/utils/currency';

export default function ProductsScreen() {
  const { products, loading } = useProducts();
  const uid = useAuthStore((state) => state.user?.uid ?? '');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  async function handleAdd() {
    const priceNumber = Number(price);
    const costNumber = cost.trim() ? Number(cost) : undefined;
    if (!name.trim() || !priceNumber || priceNumber <= 0) {
      setError('الرجاء إدخال اسم المنتج وسعر صحيح');
      return;
    }
    if (costNumber != null && (Number.isNaN(costNumber) || costNumber < 0)) {
      setError('الرجاء إدخال تكلفة صحيحة أو تركها فارغة');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: name.trim(),
          category,
          price: priceNumber,
          cost: costNumber,
          userId: uid,
        });
      } else {
        await createProduct({ name: name.trim(), category, price: priceNumber, cost: costNumber, userId: uid });
      }
      setName('');
      setPrice('');
      setCost('');
      setCategory(PRODUCT_CATEGORIES[0]);
      setEditingProduct(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(product: Product) {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(String(product.price));
    setCost(product.cost != null ? String(product.cost) : '');
    setError(null);
  }

  function cancelEditing() {
    setEditingProduct(null);
    setName('');
    setCategory(PRODUCT_CATEGORIES[0]);
    setPrice('');
    setCost('');
    setError(null);
  }

  function handleDelete(product: Product) {
    confirmAction('حذف المنتج', `هل تريد حذف ${product.name}؟ ستبقى السجلات السابقة محفوظة.`, async () => {
      setSaving(true);
      try {
        await deleteProduct(product.id, product.name, uid);
        if (editingProduct?.id === product.id) {
          cancelEditing();
        }
      } finally {
        setSaving(false);
      }
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: 'إدارة المنتجات', headerBackTitle: 'رجوع' }} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#D64535" size="large" />
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 py-4">
          {products.map((product) => (
            <View
              key={product.id}
              className="mb-2 flex-row-reverse items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
            >
              <View>
                <Text className="font-cairo-medium text-base text-text-primary dark:text-text-primary-dark">
                  {product.name}
                </Text>
                <Text className="text-right font-cairo text-xs text-text-secondary dark:text-text-secondary-dark">
                  {product.category}
                </Text>
              </View>
              <View className="items-end gap-2">
                <Text className="font-cairo-semibold text-sm text-text-primary dark:text-text-primary-dark">
                  {formatAmount(product.price)}
                </Text>
                <View className="flex-row-reverse gap-3">
                  <Pressable
                    onPress={() => startEditing(product)}
                    accessibilityRole="button"
                    accessibilityLabel={`تعديل ${product.name}`}
                  >
                    <AppIcon name="edit" size={20} color="#7A6A5F" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(product)}
                    accessibilityRole="button"
                    accessibilityLabel={`حذف ${product.name}`}
                  >
                    <AppIcon name="trash" size={20} color="#B3261E" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

          <View className="mt-6">
            <Text className="mb-3 font-cairo-semibold text-base text-text-primary dark:text-text-primary-dark">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </Text>
            <AppTextInput
              label="اسم المنتج"
              value={name}
              onChangeText={setName}
              placeholder="مثال: بيتزا مارغريتا"
            />
            <ChipSelector
              label="التصنيف"
              options={PRODUCT_CATEGORIES}
              value={category}
              onChange={setCategory}
            />
            <AppTextInput
              label="السعر"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0"
            />
            <AppTextInput
              label="التكلفة (اختياري)"
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
              placeholder="0"
            />
            {error ? (
              <Text className="mb-3 text-center font-cairo text-sm text-danger dark:text-danger-dark">
                {error}
              </Text>
            ) : null}
            <PrimaryButton
              label={editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
              onPress={handleAdd}
              loading={saving}
            />
            {editingProduct ? (
              <View className="mt-3">
                <PrimaryButton label="إلغاء التعديل" onPress={cancelEditing} variant="secondary" />
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
