import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

import type { ReportData } from './types';

function safeFileName(data: ReportData): string {
  return `${data.title}-${data.startDate}-${data.endDate}`.replace(/[^\p{L}\p{N}._-]+/gu, '-');
}

function appendSheets(workbook: XLSX.WorkBook, data: ReportData) {
  const summarySheet = XLSX.utils.json_to_sheet([
    { البند: 'الفترة', القيمة: `${data.startDate} - ${data.endDate}` },
    { البند: 'الفرع', القيمة: data.branchLabel },
    { البند: 'إجمالي الدخل', القيمة: data.totalRevenue },
    { البند: 'إجمالي المصروفات', القيمة: data.totalExpense },
    { البند: 'صافي الربح', القيمة: data.netProfit },
    { البند: 'عدد عمليات الدخل', القيمة: data.revenueCount },
    { البند: 'عدد عمليات المصروفات', القيمة: data.expenseCount },
    { البند: 'عدد الأيام التي تحتوي بيانات', القيمة: data.activeDays },
    { البند: 'متوسط إدخال الدخل', القيمة: data.averageRevenueEntry },
    { البند: 'متوسط إدخال المصروف', القيمة: data.averageExpenseEntry },
    { البند: 'أفضل يوم دخل', القيمة: data.bestRevenueDay ? `${data.bestRevenueDay.date} - ${data.bestRevenueDay.totalRevenue}` : '' },
    { البند: 'أعلى يوم مصروفات', القيمة: data.highestExpenseDay ? `${data.highestExpenseDay.date} - ${data.highestExpenseDay.totalExpense}` : '' },
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص');

  const trendSheet = XLSX.utils.json_to_sheet(
    data.dailyTrend.map((row) => ({
      التاريخ: row.date,
      الدخل: row.totalRevenue,
      المصروفات: row.totalExpense,
      'صافي الربح': row.netProfit,
    }))
  );
  XLSX.utils.book_append_sheet(workbook, trendSheet, 'اتجاه الفترة');

  const revenueSheet = XLSX.utils.json_to_sheet(
    data.revenueRows.map((row) => ({
      التاريخ: row.date,
      الفرع: row.branchName,
      الملاحظات: row.note ?? '',
      المبلغ: row.amount,
    }))
  );
  XLSX.utils.book_append_sheet(workbook, revenueSheet, 'تفاصيل الدخل');

  const expenseDetailsSheet = XLSX.utils.json_to_sheet(
    data.expenseRows.map((row) => ({
      التاريخ: row.date,
      الفرع: row.branchName,
      الملاحظات: row.note ?? '',
      المبلغ: row.amount,
    }))
  );
  XLSX.utils.book_append_sheet(workbook, expenseDetailsSheet, 'تفاصيل المصروفات');

  if (data.branchTotals.length > 1) {
    const branchSheet = XLSX.utils.json_to_sheet(
      data.branchTotals.map((branch) => ({
        الفرع: branch.branchName,
        الدخل: branch.totalRevenue,
        المصروفات: branch.totalExpense,
        'صافي الربح': branch.netProfit,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, branchSheet, 'الفروع');
  }
}

function downloadWorkbookOnWeb(workbook: XLSX.WorkBook, fileName: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('متصفح الويب غير متاح للتصدير.');
  }

  const output = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([output], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function exportReportAsExcel(data: ReportData): Promise<void> {
  const workbook = XLSX.utils.book_new();
  appendSheets(workbook, data);

  const fileName = safeFileName(data);

  if (Platform.OS === 'web') {
    downloadWorkbookOnWeb(workbook, fileName);
    return;
  }

  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  const fileUri = `${FileSystem.cacheDirectory}${fileName}.xlsx`;

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
