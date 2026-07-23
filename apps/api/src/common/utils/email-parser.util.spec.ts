import {
  parseAmountAndCurrency,
  parseBillingCycle,
  parseSubscriptionDetails,
  parseVendorName,
} from './email-parser.util';

describe('parseVendorName', () => {
  it('extracts the display name from a "Name <email>" header', () => {
    expect(parseVendorName('Netflix <billing@netflix.com>')).toBe('Netflix');
  });

  it('extracts a quoted display name', () => {
    expect(parseVendorName('"Spotify AB" <no-reply@spotify.com>')).toBe(
      'Spotify AB',
    );
  });

  it('falls back to the raw header when there is no display name', () => {
    expect(parseVendorName('billing@netflix.com')).toBe('billing@netflix.com');
  });

  it('returns null for an empty header', () => {
    expect(parseVendorName('')).toBeNull();
  });
});

describe('parseAmountAndCurrency', () => {
  it('parses a USD amount with a dollar sign', () => {
    expect(parseAmountAndCurrency('Your receipt for $9.99')).toEqual({
      amount: 9.99,
      currency: 'USD',
    });
  });

  it('parses a EUR amount with a euro sign', () => {
    expect(parseAmountAndCurrency('Total charged: €12.50')).toEqual({
      amount: 12.5,
      currency: 'EUR',
    });
  });

  it('parses an RWF amount with a currency code and thousands separator', () => {
    expect(parseAmountAndCurrency('Amount due RWF 5,000')).toEqual({
      amount: 5000,
      currency: 'RWF',
    });
  });

  it('returns nulls when no amount can be found', () => {
    expect(parseAmountAndCurrency('Thanks for being a subscriber')).toEqual({
      amount: null,
      currency: null,
    });
  });
});

describe('parseBillingCycle', () => {
  it.each([
    ['Your annual plan renewed', 'yearly'],
    ['Billed yearly', 'yearly'],
    ['Your weekly digest receipt', 'weekly'],
    ['Charged $9.99/month', 'monthly'],
    ['Your monthly subscription', 'monthly'],
  ])('detects %s as %s', (text, expected) => {
    expect(parseBillingCycle(text)).toBe(expected);
  });

  it('returns null when no cycle keyword is present', () => {
    expect(parseBillingCycle('Thanks for your payment')).toBeNull();
  });
});

describe('parseSubscriptionDetails', () => {
  it('combines vendor, amount, currency, and cycle from subject + snippet', () => {
    expect(
      parseSubscriptionDetails({
        fromHeader: 'Netflix <billing@netflix.com>',
        subject: 'Your monthly receipt',
        snippet: 'You were charged $15.99 for your Netflix subscription.',
      }),
    ).toEqual({
      vendorName: 'Netflix',
      amount: 15.99,
      currency: 'USD',
      billingCycle: 'monthly',
    });
  });

  it('leaves unresolvable fields null rather than guessing', () => {
    expect(
      parseSubscriptionDetails({
        fromHeader: 'no-reply@unknownvendor.example',
        subject: 'Order confirmation',
        snippet: 'Thanks for your order.',
      }),
    ).toEqual({
      vendorName: 'no-reply@unknownvendor.example',
      amount: null,
      currency: null,
      billingCycle: null,
    });
  });
});
