import type { BillingCycle } from '@/modules/subscriptions/entities/subscription.entity';

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addMonths(date: Date, months: number): Date {
  const day = date.getUTCDate();
  const targetMonthIndex = date.getUTCMonth() + months;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  // Clamp so e.g. Jan 31 + 1 month lands on Feb 28/29, not rolling into March.
  const clampedDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return new Date(Date.UTC(targetYear, targetMonth, clampedDay));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function calculateNextRenewalDate(
  fromDate: string,
  billingCycle: BillingCycle,
  customIntervalDays: number | null,
): string {
  const date = parseDate(fromDate);

  switch (billingCycle) {
    case 'weekly':
      return formatDate(addDays(date, 7));
    case 'monthly':
      return formatDate(addMonths(date, 1));
    case 'yearly':
      return formatDate(addMonths(date, 12));
    case 'custom':
      if (!customIntervalDays || customIntervalDays <= 0) {
        throw new Error(
          'customIntervalDays must be a positive number for a custom billing cycle',
        );
      }
      return formatDate(addDays(date, customIntervalDays));
  }
}
