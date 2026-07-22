import type { BillingCycle } from '@/modules/subscriptions/entities/subscription.entity';

const AVG_DAYS_PER_MONTH = 30.4375;

export function toMonthlyEquivalent(
  cost: number,
  billingCycle: BillingCycle,
  customIntervalDays: number | null,
): number {
  switch (billingCycle) {
    case 'weekly':
      return cost * (AVG_DAYS_PER_MONTH / 7);
    case 'monthly':
      return cost;
    case 'yearly':
      return cost / 12;
    case 'custom':
      return (
        cost * (AVG_DAYS_PER_MONTH / (customIntervalDays ?? AVG_DAYS_PER_MONTH))
      );
  }
}
