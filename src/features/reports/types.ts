export interface ReportBranchTotal {
  branchName: string;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export interface ReportExpenseCategory {
  category: string;
  total: number;
}

export interface ReportProductRow {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface ReportData {
  title: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  branchLabel: string;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  branchTotals: ReportBranchTotal[];
  expenseBreakdown: ReportExpenseCategory[];
  topProducts: ReportProductRow[];
}
