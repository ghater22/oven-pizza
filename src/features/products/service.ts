import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';

import { getFirestoreDb } from '@/src/firebase/config';
import { logOperation } from '@/src/features/audit/service';

import type { Product } from './types';

const COLLECTION = 'products';

export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  const q = query(collection(getFirestoreDb(), COLLECTION), orderBy('name', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs
      .map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<Product, 'id'>),
      }))
      .filter((product) => product.active !== false);
    callback(products);
  });
}

export async function createProduct(input: {
  name: string;
  category: string;
  price: number;
  cost?: number;
  userId?: string;
}): Promise<void> {
  const { userId, ...productInput } = input;
  const docRef = await addDoc(collection(getFirestoreDb(), COLLECTION), {
    ...productInput,
    active: true,
    createdAt: new Date(),
  });
  await logOperation({
    action: 'create',
    entity: 'product',
    entityId: docRef.id,
    label: input.name,
    userId: userId ?? '',
  });
}

export async function updateProduct(
  productId: string,
  input: Partial<Pick<Product, 'name' | 'category' | 'price' | 'cost' | 'active'>> & { userId?: string }
): Promise<void> {
  const { userId, ...updates } = input;
  await updateDoc(doc(getFirestoreDb(), COLLECTION, productId), updates);
  await logOperation({
    action: updates.active === false ? 'delete' : 'update',
    entity: 'product',
    entityId: productId,
    label: updates.name ?? 'منتج',
    userId: userId ?? '',
  });
}

export async function deleteProduct(productId: string, name = 'منتج', userId = ''): Promise<void> {
  await updateProduct(productId, { active: false, name, userId });
}
