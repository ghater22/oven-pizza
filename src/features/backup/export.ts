import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

import type { AuditLog } from '@/src/features/audit/types';
import type { Branch } from '@/src/features/branches/types';
import type { Expense } from '@/src/features/expenses/types';
import type { Product } from '@/src/features/products/types';
import type { Revenue } from '@/src/features/revenue/types';
import { todayKey } from '@/src/utils/date';

export interface BackupData {
  branches: Branch[];
  products: Product[];
  revenues: Revenue[];
  expenses: Expense[];
  logs: AuditLog[];
}

function downloadWorkbookOnWeb(workbook: XLSX.WorkBook, fileName: string) {
  const array = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([array], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportFullBackup(data: BackupData): Promise<void> {
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        order: branch.order,
        active: branch.active,
      }))
    ),
    'Branches'
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost ?? '',
        active: product.active,
      }))
    ),
    'Products'
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.revenues.map((revenue) => ({
        id: revenue.id,
        branchId: revenue.branchId,
        productId: revenue.productId,
        productName: revenue.productName,
        quantity: revenue.quantity,
        unitPrice: revenue.unitPrice,
        total: revenue.total,
        date: revenue.date,
        note: revenue.note ?? '',
        createdBy: revenue.createdBy,
      }))
    ),
    'Revenues'
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.expenses.map((expense) => ({
        id: expense.id,
        branchId: expense.branchId,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        note: expense.note ?? '',
        createdBy: expense.createdBy,
      }))
    ),
    'Expenses'
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.logs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        label: log.label,
        branchId: log.branchId ?? '',
        userId: log.userId,
        createdAt: log.createdAt.toISOString(),
      }))
    ),
    'Activity'
  );

  if (Platform.OS === 'web') {
    downloadWorkbookOnWeb(workbook, `oven-pizza-backup-${todayKey()}.xlsx`);
    return;
  }

  throw new Error('تصدير النسخة الاحتياطية الشاملة متاح حالياً من نسخة الويب.');
}
