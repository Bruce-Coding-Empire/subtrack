import { calculateNextRenewalDate } from './billing-cycle.util';
import type { BillingCycle } from '@/modules/subscriptions/entities/subscription.entity';

// Covers a weekly subscription unprocessed for over two years — defense in
// depth against an unbounded while over persisted data.
export const MAX_CATCHUP_ITERATIONS = 120;

export type CatchUpSubscription = {
  nextRenewalDate: string;
  billingCycle: BillingCycle;
  customIntervalDays: number | null;
};

export type CatchUpResult = {
  paymentDates: string[];
  nextRenewalDate: string;
  capHit: boolean;
};

export function calculateCatchUp(
  subscription: CatchUpSubscription,
  today: string,
): CatchUpResult {
  const paymentDates: string[] = [];
  let nextRenewalDate = subscription.nextRenewalDate;
  let capHit = false;

  while (nextRenewalDate <= today) {
    if (paymentDates.length >= MAX_CATCHUP_ITERATIONS) {
      capHit = true;
      break;
    }
    paymentDates.push(nextRenewalDate);
    nextRenewalDate = calculateNextRenewalDate(
      nextRenewalDate,
      subscription.billingCycle,
      subscription.customIntervalDays,
    );
  }

  return { paymentDates, nextRenewalDate, capHit };
}
