function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/** YYYY-MM-DD بالتوقيت المحلي للجهاز (وليس UTC، لتفادي انزياح يوم كامل). */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export type AnalyticsPeriod = 'today' | 'week' | 'month';

export interface DateRange {
  startDate: string;
  endDate: string;
}

/** يُرجع مدى تاريخ (شامل الطرفين) لفترة تحليل شائعة، ينتهي دائمًا باليوم الحالي. */
export function dateRangeForPeriod(period: AnalyticsPeriod): DateRange {
  const now = new Date();
  const endDate = toDateKey(now);

  if (period === 'today') {
    return { startDate: endDate, endDate };
  }
  if (period === 'week') {
    return { startDate: toDateKey(startOfWeek(now)), endDate };
  }
  return { startDate: toDateKey(startOfMonth(now)), endDate };
}

export const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  today: 'اليوم',
  week: 'هذا الأسبوع',
  month: 'هذا الشهر',
};
