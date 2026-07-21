import { calculateNextRenewalDate } from './billing-cycle.util';

describe('calculateNextRenewalDate', () => {
  it('advances weekly by 7 days', () => {
    expect(calculateNextRenewalDate('2026-01-01', 'weekly', null)).toBe(
      '2026-01-08',
    );
  });

  it('advances monthly by 1 month', () => {
    expect(calculateNextRenewalDate('2026-01-15', 'monthly', null)).toBe(
      '2026-02-15',
    );
  });

  it('clamps month-end overflow (Jan 31 -> Feb 28 in a non-leap year)', () => {
    expect(calculateNextRenewalDate('2026-01-31', 'monthly', null)).toBe(
      '2026-02-28',
    );
  });

  it('clamps month-end overflow to Feb 29 in a leap year', () => {
    expect(calculateNextRenewalDate('2028-01-31', 'monthly', null)).toBe(
      '2028-02-29',
    );
  });

  it('advances yearly by 1 year', () => {
    expect(calculateNextRenewalDate('2026-03-10', 'yearly', null)).toBe(
      '2027-03-10',
    );
  });

  it('clamps Feb 29 -> Feb 28 when advancing a year into a non-leap year', () => {
    expect(calculateNextRenewalDate('2028-02-29', 'yearly', null)).toBe(
      '2029-02-28',
    );
  });

  it('advances custom by the given number of days', () => {
    expect(calculateNextRenewalDate('2026-06-10', 'custom', 45)).toBe(
      '2026-07-25',
    );
  });

  it('throws if custom cycle has no interval', () => {
    expect(() =>
      calculateNextRenewalDate('2026-06-10', 'custom', null),
    ).toThrow();
  });

  it('throws if custom interval is not positive', () => {
    expect(() => calculateNextRenewalDate('2026-06-10', 'custom', 0)).toThrow();
  });

  it('rolls over December into the next year for monthly', () => {
    expect(calculateNextRenewalDate('2026-12-20', 'monthly', null)).toBe(
      '2027-01-20',
    );
  });
});
