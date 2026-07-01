import type { Product } from '@/src/features/products/types';
import type { Revenue } from '@/src/features/revenue/types';

export interface ProductPerformance {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  /** null إن لم تُسجَّل تكلفة للمنتج بعد */
  estimatedProfit: number | null;
}

export function aggregateProductPerformance(
  revenues: Revenue[],
  products: Product[]
): ProductPerformance[] {
  const totals = new Map<string, { productName: string; totalQuantity: number; totalRevenue: number }>();

  for (const revenue of revenues) {
    const entry = totals.get(revenue.productId) ?? {
      productName: revenue.productName,
      totalQuantity: 0,
      totalRevenue: 0,
    };
    entry.totalQuantity += revenue.quantity;
    entry.totalRevenue += revenue.total;
    totals.set(revenue.productId, entry);
  }

  return Array.from(totals.entries()).map(([productId, entry]) => {
    const product = products.find((item) => item.id === productId);
    const estimatedProfit =
      product?.cost != null ? entry.totalRevenue - entry.totalQuantity * product.cost : null;

    return {
      productId,
      productName: entry.productName,
      totalQuantity: entry.totalQuantity,
      totalRevenue: entry.totalRevenue,
      estimatedProfit,
    };
  });
}

export function topByQuantity(items: ProductPerformance[], limit = 5): ProductPerformance[] {
  return [...items].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, limit);
}

export function bottomByQuantity(items: ProductPerformance[], limit = 5): ProductPerformance[] {
  return [...items].sort((a, b) => a.totalQuantity - b.totalQuantity).slice(0, limit);
}

export function topByProfit(items: ProductPerformance[], limit = 5): ProductPerformance[] {
  return [...items]
    .filter((item) => item.estimatedProfit != null)
    .sort((a, b) => (b.estimatedProfit as number) - (a.estimatedProfit as number))
    .slice(0, limit);
}

/** لكل فرع، أداء المنتجات ضمنه — يُستخدم لمقارنة نفس المنتج بين الفروع. */
export function aggregateProductPerformanceByBranch(
  revenuesByBranch: Record<string, Revenue[]>,
  products: Product[]
): Record<string, ProductPerformance[]> {
  const result: Record<string, ProductPerformance[]> = {};
  for (const [branchId, revenues] of Object.entries(revenuesByBranch)) {
    result[branchId] = aggregateProductPerformance(revenues, products);
  }
  return result;
}
