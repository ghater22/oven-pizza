export interface Revenue {
  id: string;
  branchId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  /** YYYY-MM-DD */
  date: string;
  timestamp: Date;
  note?: string;
  createdBy: string;
  receiptName?: string;
  receiptPath?: string;
  receiptUrl?: string;
}
