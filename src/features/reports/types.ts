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

export interface ReportProductCategoryTotal {
  category: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface ReportDailyTrendRow {
  date: string;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  totalQuantity: number;
}

export interface ReportRevenueRow {
  date: string;
  branchName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReportExpenseRow {
  date: string;
  branchName: string;
  category: string;
  amount: number;
  note?: string;
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
  totalSoldQuantity: number;
  pizzaSoldQuantity: number;
  drinkSoldQuantity: number;
  sauceSoldQuantity: number;
  averageRevenueTicket: number;
  revenueCount: number;
  expenseCount: number;
  branchTotals: ReportBranchTotal[];
  expenseBreakdown: ReportExpenseCategory[];
  topProducts: ReportProductRow[];
  productCategoryTotals: ReportProductCategoryTotal[];
  dailyTrend: ReportDailyTrendRow[];
  revenueRows: ReportRevenueRow[];
  expenseRows: ReportExpenseRow[];
}
