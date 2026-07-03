import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { formatAmount } from '@/src/utils/currency';

import type { ReportData } from './types';

function escapeHtml(value: string | number | undefined | null): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function tableOrEmpty(headers: string[], rows: string[][], emptyText: string): string {
  if (rows.length === 0) return `<div class="empty">${escapeHtml(emptyText)}</div>`;

  return `
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
}

function buildBars(rows: { label: string; value: number; helper: string }[], tone = 'primary'): string {
  const max = Math.max(...rows.map((row) => Math.abs(row.value)), 1);
  return rows
    .map((row) => {
      const width = row.value !== 0 ? Math.max(5, Math.round((Math.abs(row.value) / max) * 100)) : 0;
      return `<div class="bar-row"><span>${escapeHtml(row.label)}</span><div class="bar-track"><div class="bar-fill ${tone}" style="width:${width}%"></div></div><b>${escapeHtml(row.helper)}</b></div>`;
    })
    .join('');
}

function buildHtml(data: ReportData): string {
  const generatedAt = new Date().toLocaleString('ar-SA');
  const revenueRows = data.revenueRows.map((row) => [
    row.date,
    row.branchName,
    row.note ?? '-',
    formatAmount(row.amount),
  ]);
  const expenseRows = data.expenseRows.map((row) => [
    row.date,
    row.branchName,
    row.note ?? '-',
    formatAmount(row.amount),
  ]);
  const branchRows = data.branchTotals.map((branch) => [
    branch.branchName,
    formatAmount(branch.totalRevenue),
    formatAmount(branch.totalExpense),
    formatAmount(branch.netProfit),
  ]);
  const trendRows = data.dailyTrend.map((row) => [
    row.date,
    formatAmount(row.totalRevenue),
    formatAmount(row.totalExpense),
    formatAmount(row.netProfit),
  ]);
  const revenueBars = buildBars(
    data.dailyTrend.slice(-12).map((row) => ({
      label: row.date,
      value: row.totalRevenue,
      helper: formatAmount(row.totalRevenue),
    })),
    'success'
  );
  const expenseBars = buildBars(
    data.dailyTrend.slice(-12).map((row) => ({
      label: row.date,
      value: row.totalExpense,
      helper: formatAmount(row.totalExpense),
    })),
    'danger'
  );

  return `
  <!doctype html>
  <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(data.title)}</title>
      <style>
        @page { size: A4; margin: 13mm; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #fff; color: #2B1B12; direction: rtl; font-family: Arial, Tahoma, sans-serif; font-size: 12px; line-height: 1.6; }
        h1 { color: #D64535; font-size: 24px; margin: 0 0 4px; }
        h2 { border-bottom: 1px solid #EDE0D4; font-size: 16px; margin: 24px 0 10px; padding-bottom: 6px; }
        .subtitle { color: #7A6A5F; margin-bottom: 18px; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
        .summary.four { grid-template-columns: repeat(4, 1fr); }
        .card { border: 1px solid #EDE0D4; border-radius: 10px; padding: 10px 12px; }
        .label { color: #7A6A5F; font-size: 11px; }
        .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
        .positive { color: #2F8F5B; }
        .negative { color: #A93025; }
        table { border-collapse: collapse; margin-bottom: 8px; width: 100%; }
        th, td { border: 1px solid #EDE0D4; padding: 7px 8px; text-align: right; vertical-align: top; }
        th { background: #FFF6F0; color: #7A6A5F; font-weight: 700; }
        tr:nth-child(even) td { background: #FFFCFA; }
        .empty { border: 1px dashed #EDE0D4; border-radius: 10px; color: #7A6A5F; padding: 14px; }
        .bar-row { align-items: center; display: grid; grid-template-columns: 115px 1fr 110px; gap: 8px; margin: 8px 0; }
        .bar-track { background: #FFF6F0; border-radius: 999px; height: 9px; overflow: hidden; }
        .bar-fill { background: #D64535; border-radius: 999px; height: 9px; }
        .bar-fill.success { background: #2F8F5B; }
        .bar-fill.danger { background: #A93025; }
        .footer { color: #7A6A5F; font-size: 10px; margin-top: 24px; text-align: center; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } h2 { break-after: avoid; } tr { break-inside: avoid; } }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(data.title)}</h1>
      <div class="subtitle">${escapeHtml(data.periodLabel)} (${escapeHtml(data.startDate)} - ${escapeHtml(data.endDate)}) | ${escapeHtml(data.branchLabel)} | تاريخ التصدير: ${escapeHtml(generatedAt)}</div>

      <div class="summary">
        <div class="card"><div class="label">إجمالي الدخل</div><div class="value positive">${escapeHtml(formatAmount(data.totalRevenue))}</div></div>
        <div class="card"><div class="label">إجمالي المصروفات</div><div class="value negative">${escapeHtml(formatAmount(data.totalExpense))}</div></div>
        <div class="card"><div class="label">صافي الربح</div><div class="value ${data.netProfit >= 0 ? 'positive' : 'negative'}">${escapeHtml(formatAmount(data.netProfit))}</div></div>
      </div>

      <h2>ملخص الفترة</h2>
      <div class="summary four">
        <div class="card"><div class="label">عدد عمليات الدخل</div><div class="value">${escapeHtml(data.revenueCount)}</div></div>
        <div class="card"><div class="label">عدد عمليات المصروفات</div><div class="value">${escapeHtml(data.expenseCount)}</div></div>
        <div class="card"><div class="label">متوسط إدخال الدخل</div><div class="value">${escapeHtml(formatAmount(data.averageRevenueEntry))}</div></div>
        <div class="card"><div class="label">متوسط إدخال المصروف</div><div class="value">${escapeHtml(formatAmount(data.averageExpenseEntry))}</div></div>
      </div>
      <div class="summary">
        <div class="card"><div class="label">أيام تحتوي بيانات</div><div class="value">${escapeHtml(data.activeDays)}</div></div>
        <div class="card"><div class="label">أفضل يوم دخل</div><div class="value">${escapeHtml(data.bestRevenueDay ? `${data.bestRevenueDay.date} - ${formatAmount(data.bestRevenueDay.totalRevenue)}` : '-')}</div></div>
        <div class="card"><div class="label">أعلى يوم مصروفات</div><div class="value">${escapeHtml(data.highestExpenseDay ? `${data.highestExpenseDay.date} - ${formatAmount(data.highestExpenseDay.totalExpense)}` : '-')}</div></div>
      </div>

      <h2>اتجاه الدخل اليومي</h2>
      ${revenueBars || '<div class="empty">لا توجد بيانات دخل في هذه الفترة.</div>'}

      <h2>اتجاه المصروفات اليومية</h2>
      ${expenseBars || '<div class="empty">لا توجد بيانات مصروفات في هذه الفترة.</div>'}

      <h2>تفاصيل الدخل</h2>
      ${tableOrEmpty(['التاريخ', 'الفرع', 'الملاحظات', 'المبلغ'], revenueRows, 'لا توجد إيرادات في هذه الفترة.')}

      <h2>تفاصيل المصروفات</h2>
      ${tableOrEmpty(['التاريخ', 'الفرع', 'الملاحظات', 'المبلغ'], expenseRows, 'لا توجد مصروفات في هذه الفترة.')}

      ${data.branchTotals.length > 1 ? `<h2>مقارنة الفروع</h2>${tableOrEmpty(['الفرع', 'الدخل', 'المصروفات', 'صافي الربح'], branchRows, 'لا توجد بيانات فروع.')}` : ''}

      <h2>جدول اتجاه الفترة</h2>
      ${tableOrEmpty(['التاريخ', 'الدخل', 'المصروفات', 'صافي الربح'], trendRows, 'لا توجد بيانات اتجاه.')}

      <div class="footer">بيتزا الفرن - تقرير مالي من النظام</div>
    </body>
  </html>`;
}

function printHtmlOnWeb(html: string): void {
  if (typeof window === 'undefined') throw new Error('متصفح الويب غير متاح للتصدير.');

  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('اسمح بفتح النوافذ المنبثقة ثم أعد محاولة تصدير التقرير.');

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 350);
}

export async function exportReportAsPdf(data: ReportData): Promise<void> {
  const html = buildHtml(data);
  if (Platform.OS === 'web') {
    printHtmlOnWeb(html);
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}
