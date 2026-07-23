export type ParsedBillingCycle = 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface CandidateEmail {
  fromHeader: string;
  subject: string;
  snippet: string;
}

export interface ParsedSubscriptionDetails {
  vendorName: string | null;
  amount: number | null;
  currency: string | null;
  billingCycle: ParsedBillingCycle | null;
}

const AMOUNT = '([\\d,]+(?:\\.\\d{2})?)';
const CURRENCY_PATTERNS: Array<{ code: string; regex: RegExp }> = [
  { code: 'USD', regex: new RegExp(`\\$\\s?${AMOUNT}`) },
  { code: 'EUR', regex: new RegExp(`€\\s?${AMOUNT}`) },
  { code: 'RWF', regex: new RegExp(`\\bRWF\\s?${AMOUNT}`, 'i') },
  { code: 'USD', regex: new RegExp(`\\bUSD\\s?${AMOUNT}`, 'i') },
  { code: 'EUR', regex: new RegExp(`\\bEUR\\s?${AMOUNT}`, 'i') },
];

const CYCLE_KEYWORDS: Array<{ cycle: ParsedBillingCycle; regex: RegExp }> = [
  { cycle: 'yearly', regex: /\b(annual(ly)?|yearly|per year|\/year)\b/i },
  { cycle: 'weekly', regex: /\b(weekly|per week|\/week)\b/i },
  { cycle: 'monthly', regex: /\b(monthly|per month|\/month|\/mo)\b/i },
];

export function parseVendorName(fromHeader: string): string | null {
  const match = fromHeader.match(/^"?([^"<]+?)"?\s*<[^>]+>$/);
  const name = (match ? match[1] : fromHeader).trim();
  return name.length > 0 ? name : null;
}

export function parseAmountAndCurrency(text: string): {
  amount: number | null;
  currency: string | null;
} {
  for (const { code, regex } of CURRENCY_PATTERNS) {
    const match = text.match(regex);
    if (!match) continue;
    const amount = Number(match[1].replace(/,/g, ''));
    if (!Number.isNaN(amount)) {
      return { amount, currency: code };
    }
  }
  return { amount: null, currency: null };
}

export function parseBillingCycle(text: string): ParsedBillingCycle | null {
  for (const { cycle, regex } of CYCLE_KEYWORDS) {
    if (regex.test(text)) return cycle;
  }
  return null;
}

export function parseSubscriptionDetails(
  email: CandidateEmail,
): ParsedSubscriptionDetails {
  const combinedText = `${email.subject} ${email.snippet}`;
  const { amount, currency } = parseAmountAndCurrency(combinedText);
  return {
    vendorName: parseVendorName(email.fromHeader),
    amount,
    currency,
    billingCycle: parseBillingCycle(combinedText),
  };
}
