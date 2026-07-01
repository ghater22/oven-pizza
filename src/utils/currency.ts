/** تنسيق مبلغ بفواصل الآلاف بدون تقريب مضلل (خانتان عشريتان فقط إن لزم). */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('ar', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}
