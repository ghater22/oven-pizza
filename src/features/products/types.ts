export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost?: number;
  active: boolean;
}

export const PRODUCT_CATEGORIES = ['بيتزا', 'مقبلات', 'مشروبات', 'حلويات', 'أخرى'] as const;
