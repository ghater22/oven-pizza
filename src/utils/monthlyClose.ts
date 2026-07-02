export const MONTHLY_CLOSE_DAY = 5;

export function getMonthlyCloseDate(accountingDate: Date): Date {
  return new Date(accountingDate.getFullYear(), accountingDate.getMonth() + 1, MONTHLY_CLOSE_DAY);
}

export function isAccountingDateClosed(accountingDate: Date, now = new Date()): boolean {
  return now >= getMonthlyCloseDate(accountingDate);
}
