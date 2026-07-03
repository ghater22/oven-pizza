export interface ReportBranchTotal {
  branchName: string;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export interface ReportDailyTrendRow {
  date: string;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export interface ReportRevenueRow {
  date: string;
  branchName: string;
  amount: number;
  note?: string;
}

export interface ReportExpenseRow {
  date: string;
  branchName: string;
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
  averageRevenueEntry: number;
  averageExpenseEntry: number;
  revenueCount: number;
  expenseCount: number;
  activeDays: number;
  bestRevenueDay?: ReportDailyTrendRow;
  highestExpenseDay?: ReportDailyTrendRow;
  branchTotals: ReportBranchTotal[];
  dailyTrend: ReportDailyTrendRow[];
  revenueRows: ReportRevenueRow[];
  expenseRows: ReportExpenseRow[];
}
