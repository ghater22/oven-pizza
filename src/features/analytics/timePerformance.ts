import type { Revenue } from '@/src/features/revenue/types';

export interface HourBucket {
  hour: number;
  total: number;
}

export interface DayBucket {
  day: number;
  label: string;
  total: number;
}

export const DAY_LABELS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function aggregateByHour(revenues: Revenue[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, hour) => ({ hour, total: 0 }));
  for (const revenue of revenues) {
    buckets[revenue.timestamp.getHours()].total += revenue.total;
  }
  return buckets;
}

export function aggregateByDayOfWeek(revenues: Revenue[]): DayBucket[] {
  const buckets: DayBucket[] = DAY_LABELS.map((label, day) => ({ day, label, total: 0 }));
  for (const revenue of revenues) {
    buckets[revenue.timestamp.getDay()].total += revenue.total;
  }
  return buckets;
}

export function peakHours(buckets: HourBucket[], count = 3): HourBucket[] {
  return [...buckets]
    .filter((bucket) => bucket.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, count);
}

export function slowHours(buckets: HourBucket[], count = 3): HourBucket[] {
  return [...buckets]
    .filter((bucket) => bucket.total > 0)
    .sort((a, b) => a.total - b.total)
    .slice(0, count);
}

export function bestDays(buckets: DayBucket[], count = 2): DayBucket[] {
  return [...buckets]
    .filter((bucket) => bucket.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, count);
}

export function worstDays(buckets: DayBucket[], count = 2): DayBucket[] {
  return [...buckets]
    .filter((bucket) => bucket.total > 0)
    .sort((a, b) => a.total - b.total)
    .slice(0, count);
}

export function formatHourLabel(hour: number): string {
  const period = hour < 12 ? 'ص' : 'م';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}
