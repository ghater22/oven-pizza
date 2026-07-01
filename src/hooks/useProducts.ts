import { useEffect, useState } from 'react';

import { subscribeToProducts } from '@/src/features/products/service';
import type { Product } from '@/src/features/products/types';

export function useProducts(): { products: Product[]; loading: boolean } {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((next) => {
      setProducts(next);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { products, loading };
}
