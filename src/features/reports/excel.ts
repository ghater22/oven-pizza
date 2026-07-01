import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import type { ReportData } from './types';

export async function exportReportAsExcel(data: ReportData): Promise<void> {
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet([
    { البند: 'الدخل', المبلغ: data.totalRevenue },
    { البند: 'المصروف', المبلغ: data.totalExpense },
    { البند: 'صافي الربح', المبلغ: data.netProfit },
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص');

  if (data.branchTotals.length > 1) {
    const branchSheet = XLSX.utils.json_to_sheet(
      data.branchTotals.map((branch) => ({
        الفرع: branch.branchName,
        الدخل: branch.totalRevenue,
        المصروف: branch.totalExpense,
        'صافي الربح': branch.netProfit,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, branchSheet, 'الفروع');
  }

  if (data.expenseBreakdown.length > 0) {
    const expenseSheet = XLSX.utils.json_to_sheet(
      data.expenseBreakdown.map((row) => ({ التصنيف: row.category, المبلغ: row.total }))
    );
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'المصروفات');
  }

  if (data.topProducts.length > 0) {
    const productSheet = XLSX.utils.json_to_sheet(
      data.topProducts.map((row) => ({
        المنتج: row.productName,
        الكمية: row.totalQuantity,
        الإيراد: row.totalRevenue,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, productSheet, 'المنتجات');
  }

  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  const fileUri = `${FileSystem.cacheDirectory}${data.title.replace(/\s+/g, '-')}.xlsx`;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
    });
  }
}
