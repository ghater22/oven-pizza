import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { formatAmount } from '@/src/utils/currency';

import type { ReportData } from './types';

function buildHtml(data: ReportData): string {
  const branchRows = data.branchTotals
    .map(
      (branch) => `
        <tr>
          <td>${branch.branchName}</td>
          <td>${formatAmount(branch.totalRevenue)}</td>
          <td>${formatAmount(branch.totalExpense)}</td>
          <td>${formatAmount(branch.netProfit)}</td>
        </tr>`
    )
    .join('');

  const expenseRows = data.expenseBreakdown
    .map(
      (row) => `
        <tr><td>${row.category}</td><td>${formatAmount(row.total)}</td></tr>`
    )
    .join('');

  const productRows = data.topProducts
    .map(
      (row) => `
        <tr><td>${row.productName}</td><td>${row.totalQuantity}</td><td>${formatAmount(row.totalRevenue)}</td></tr>`
    )
    .join('');

  return `
  <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, Arial, sans-serif; padding: 24px; color: #2B1B12; direction: rtl; }
        h1 { color: #D64535; font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #7A6A5F; font-size: 13px; margin-bottom: 20px; }
        .summary { display: flex; gap: 12px; margin-bottom: 24px; }
        .card { border: 1px solid #EDE0D4; border-radius: 12px; padding: 12px 16px; flex: 1; }
        .card .label { color: #7A6A5F; font-size: 12px; }
        .card .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
        h2 { font-size: 15px; color: #2B1B12; margin-top: 28px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { border-bottom: 1px solid #EDE0D4; padding: 8px 6px; text-align: right; }
        th { color: #7A6A5F; font-weight: 600; }
      </style>
    </head>
    <body>
      <h1>${data.title}</h1>
      <div class="subtitle">${data.periodLabel} (${data.startDate} — ${data.endDate}) · ${data.branchLabel}</div>

      <div class="summary">
        <div class="card"><div class="label">الدخل</div><div class="value">${formatAmount(data.totalRevenue)}</div></div>
        <div class="card"><div class="label">المصروف</div><div class="value">${formatAmount(data.totalExpense)}</div></div>
        <div class="card"><div class="label">صافي الربح</div><div class="value">${formatAmount(data.netProfit)}</div></div>
      </div>

      ${
        data.branchTotals.length > 1
          ? `<h2>مقارنة الفروع</h2>
      <table>
        <thead><tr><th>الفرع</th><th>الدخل</th><th>المصروف</th><th>صافي الربح</th></tr></thead>
        <tbody>${branchRows}</tbody>
      </table>`
          : ''
      }

      ${
        data.expenseBreakdown.length > 0
          ? `<h2>المصروفات حسب التصنيف</h2>
      <table>
        <thead><tr><th>التصنيف</th><th>المبلغ</th></tr></thead>
        <tbody>${expenseRows}</tbody>
      </table>`
          : ''
      }

      ${
        data.topProducts.length > 0
          ? `<h2>أفضل المنتجات</h2>
      <table>
        <thead><tr><th>المنتج</th><th>الكمية</th><th>الإيراد</th></tr></thead>
        <tbody>${productRows}</tbody>
      </table>`
          : ''
      }
    </body>
  </html>`;
}

export async function exportReportAsPdf(data: ReportData): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: buildHtml(data) });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}
