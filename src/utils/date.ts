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
