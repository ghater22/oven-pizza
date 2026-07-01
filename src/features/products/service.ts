import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';

import { getFirestoreDb } from '@/src/firebase/config';

import type { Product } from './types';

const COLLECTION = 'products';

export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  const q = query(collection(getFirestoreDb(), COLLECTION), orderBy('name', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...(docSnapshot.data() as Omit<Product, 'id'>),
    }));
    callback(products);
  });
}

export async function createProduct(input: {
  name: string;
  category: string;
  price: number;
  cost?: number;
}): Promise<void> {
  await addDoc(collection(getFirestoreDb(), COLLECTION), {
    ...input,
    active: true,
    createdAt: new Date(),
  });
}

export async function updateProduct(
  productId: string,
  input: Partial<Pick<Product, 'name' | 'category' | 'price' | 'cost' | 'active'>>
): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), COLLECTION, productId), input);
}
