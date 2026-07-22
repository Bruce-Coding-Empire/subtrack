import { toMonthlyEquivalent } from './spend.util';

describe('toMonthlyEquivalent', () => {
  it('passes a monthly cost through unchanged', () => {
    expect(toMonthlyEquivalent(15.99, 'monthly', null)).toBe(15.99);
  });

  it('divides a yearly cost by 12', () => {
    expect(toMonthlyEquivalent(120, 'yearly', null)).toBe(10);
  });

  it('normalizes a weekly cost to an average month length', () => {
    expect(toMonthlyEquivalent(7, 'weekly', null)).toBeCloseTo(30.4375, 4);
  });

  it('normalizes a custom-interval cost by its day count', () => {
    expect(toMonthlyEquivalent(10, 'custom', 10)).toBeCloseTo(30.4375, 4);
  });

  it('falls back to the average month length when customIntervalDays is missing', () => {
    expect(toMonthlyEquivalent(10, 'custom', null)).toBe(10);
  });
});
