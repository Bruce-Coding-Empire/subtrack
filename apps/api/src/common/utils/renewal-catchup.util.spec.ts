import {
  calculateCatchUp,
  MAX_CATCHUP_ITERATIONS,
} from './renewal-catchup.util';

describe('calculateCatchUp', () => {
  it('produces no payments when the subscription is not yet due', () => {
    const result = calculateCatchUp(
      {
        nextRenewalDate: '2026-08-01',
        billingCycle: 'monthly',
        customIntervalDays: null,
      },
      '2026-07-24',
    );
    expect(result).toEqual({
      paymentDates: [],
      nextRenewalDate: '2026-08-01',
      capHit: false,
    });
  });

  it('logs exactly one payment dated today when due today, and advances past today', () => {
    const result = calculateCatchUp(
      {
        nextRenewalDate: '2026-07-24',
        billingCycle: 'monthly',
        customIntervalDays: null,
      },
      '2026-07-24',
    );
    expect(result.paymentDates).toEqual(['2026-07-24']);
    expect(result.nextRenewalDate).toBe('2026-08-24');
    expect(result.capHit).toBe(false);
  });

  it('backfills multiple missed weekly cycles, dated at each due date not today', () => {
    const result = calculateCatchUp(
      {
        nextRenewalDate: '2026-07-01',
        billingCycle: 'weekly',
        customIntervalDays: null,
      },
      '2026-07-24',
    );
    expect(result.paymentDates).toEqual([
      '2026-07-01',
      '2026-07-08',
      '2026-07-15',
      '2026-07-22',
    ]);
    expect(result.nextRenewalDate).toBe('2026-07-29');
    expect(result.capHit).toBe(false);
  });

  it('backfills multiple missed monthly cycles', () => {
    const result = calculateCatchUp(
      {
        nextRenewalDate: '2026-04-15',
        billingCycle: 'monthly',
        customIntervalDays: null,
      },
      '2026-07-24',
    );
    expect(result.paymentDates).toEqual([
      '2026-04-15',
      '2026-05-15',
      '2026-06-15',
      '2026-07-15',
    ]);
    expect(result.nextRenewalDate).toBe('2026-08-15');
    expect(result.capHit).toBe(false);
  });

  it('backfills multiple missed yearly cycles', () => {
    const result = calculateCatchUp(
      {
        nextRenewalDate: '2023-07-24',
        billingCycle: 'yearly',
        customIntervalDays: null,
      },
      '2026-07-24',
    );
    expect(result.paymentDates).toEqual([
      '2023-07-24',
      '2024-07-24',
      '2025-07-24',
      '2026-07-24',
    ]);
    expect(result.nextRenewalDate).toBe('2027-07-24');
    expect(result.capHit).toBe(false);
  });

  it('backfills multiple missed custom-interval cycles', () => {
    const result = calculateCatchUp(
      {
        nextRenewalDate: '2026-06-24',
        billingCycle: 'custom',
        customIntervalDays: 10,
      },
      '2026-07-24',
    );
    expect(result.paymentDates).toEqual([
      '2026-06-24',
      '2026-07-04',
      '2026-07-14',
      '2026-07-24',
    ]);
    expect(result.nextRenewalDate).toBe('2026-08-03');
    expect(result.capHit).toBe(false);
  });

  it('stops at the iteration cap and reports capHit, leaving the subscription still overdue', () => {
    const result = calculateCatchUp(
      {
        nextRenewalDate: '2020-01-01',
        billingCycle: 'weekly',
        customIntervalDays: null,
      },
      '2026-07-24',
    );
    expect(result.paymentDates).toHaveLength(MAX_CATCHUP_ITERATIONS);
    expect(result.capHit).toBe(true);
    // Still due — the next run's query will pick this subscription back up.
    expect(result.nextRenewalDate <= '2026-07-24').toBe(true);
  });
});
