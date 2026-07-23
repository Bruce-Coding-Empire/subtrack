import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { CurrencyService } from '@/modules/currency/currency.service';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entities/user.entity';
import { toMonthlyEquivalent } from '@/common/utils/spend.util';
import {
  Subscription,
  SubscriptionCategory,
} from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';

const UPCOMING_RENEWALS_WINDOW_DAYS = 7;

type SummaryResponse = {
  totalMonthlySpend: number;
  totalYearlySpend: number;
  baseCurrency: string;
  activeSubscriptionsCount: number;
  categoryBreakdown: {
    category: SubscriptionCategory;
    amount: number;
    percentage: number;
  }[];
  upcomingRenewals: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    nextRenewalDate: string;
  }[];
  spendLimit: number | null;
  currentMonthSpend: number;
  percentageUsed: number | null;
  isOverLimit: boolean;
};

type SpendTrendResponse = {
  baseCurrency: string;
  points: { month: string; amount: number }[];
};

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepo: Repository<PaymentHistory>,
    private readonly currencyService: CurrencyService,
    private readonly usersService: UsersService,
  ) {}

  async getSummary(userId: string): Promise<SummaryResponse> {
    const user = await this.getUser(userId);
    const baseCurrency = user.baseCurrency;

    const activeSubscriptions = await this.subscriptionRepo.find({
      where: { userId, status: 'active' },
    });

    let totalMonthlySpend = 0;
    const categoryTotals = new Map<SubscriptionCategory, number>();

    for (const subscription of activeSubscriptions) {
      const monthlyEquivalent = toMonthlyEquivalent(
        subscription.cost,
        subscription.billingCycle,
        subscription.customIntervalDays,
      );
      const converted = await this.convertSafely(
        monthlyEquivalent,
        subscription.currency,
        baseCurrency,
      );
      totalMonthlySpend += converted;
      categoryTotals.set(
        subscription.category,
        (categoryTotals.get(subscription.category) ?? 0) + converted,
      );
    }

    const categoryBreakdown = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount: round(amount, 2),
        percentage:
          totalMonthlySpend > 0
            ? round((amount / totalMonthlySpend) * 100, 1)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const today = formatDateUTC(new Date());
    const windowEnd = formatDateUTC(
      addDaysUTC(new Date(), UPCOMING_RENEWALS_WINDOW_DAYS),
    );

    const upcomingRenewals = activeSubscriptions
      .filter(
        (subscription) =>
          subscription.nextRenewalDate >= today &&
          subscription.nextRenewalDate <= windowEnd,
      )
      .sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate))
      .map((subscription) => ({
        id: subscription.id,
        name: subscription.name,
        amount: subscription.cost,
        currency: subscription.currency,
        nextRenewalDate: subscription.nextRenewalDate,
      }));

    const currentMonthSpend = await this.getCurrentMonthSpend(
      userId,
      baseCurrency,
    );
    const spendLimit = user.monthlySpendLimit;
    const percentageUsed =
      spendLimit !== null && spendLimit > 0
        ? round((currentMonthSpend / spendLimit) * 100, 1)
        : null;
    const isOverLimit = spendLimit !== null && currentMonthSpend > spendLimit;

    return {
      totalMonthlySpend: round(totalMonthlySpend, 2),
      totalYearlySpend: round(totalMonthlySpend * 12, 2),
      baseCurrency,
      activeSubscriptionsCount: activeSubscriptions.length,
      categoryBreakdown,
      upcomingRenewals,
      spendLimit,
      currentMonthSpend: round(currentMonthSpend, 2),
      percentageUsed,
      isOverLimit,
    };
  }

  private async getCurrentMonthSpend(
    userId: string,
    baseCurrency: string,
  ): Promise<number> {
    const now = new Date();
    const monthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
    const nextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
    const monthEnd = formatDateUTC(new Date(nextMonth.getTime() - 1));

    const history = await this.paymentHistoryRepo.find({
      where: { userId, paidAt: Between(monthStart, monthEnd) },
    });

    const totalsByCurrency = new Map<string, number>();
    for (const entry of history) {
      totalsByCurrency.set(
        entry.currency,
        (totalsByCurrency.get(entry.currency) ?? 0) + entry.amount,
      );
    }

    let total = 0;
    for (const [currency, subtotal] of totalsByCurrency) {
      total += await this.convertSafely(subtotal, currency, baseCurrency);
    }
    return total;
  }

  async getSpendTrend(
    userId: string,
    months: number,
  ): Promise<SpendTrendResponse> {
    const { baseCurrency } = await this.getUser(userId);
    const monthKeys = buildMonthKeys(months);

    const history = await this.paymentHistoryRepo.find({
      where: { userId, paidAt: MoreThanOrEqual(`${monthKeys[0]}-01`) },
    });

    const totalsByMonth = new Map<string, Map<string, number>>();
    for (const entry of history) {
      const month = entry.paidAt.slice(0, 7);
      const currencyTotals =
        totalsByMonth.get(month) ?? new Map<string, number>();
      currencyTotals.set(
        entry.currency,
        (currencyTotals.get(entry.currency) ?? 0) + entry.amount,
      );
      totalsByMonth.set(month, currencyTotals);
    }

    const points: { month: string; amount: number }[] = [];
    for (const month of monthKeys) {
      const currencyTotals = totalsByMonth.get(month);
      let amount = 0;
      if (currencyTotals) {
        for (const [currency, subtotal] of currencyTotals) {
          amount += await this.convertSafely(subtotal, currency, baseCurrency);
        }
      }
      points.push({ month, amount: round(amount, 2) });
    }

    return { baseCurrency, points };
  }

  private async getUser(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async convertSafely(
    amount: number,
    from: string,
    to: string,
  ): Promise<number> {
    try {
      return await this.currencyService.getConvertedAmount(amount, from, to);
    } catch (error) {
      this.logger.warn(
        `Skipping unconvertible amount ${from} -> ${to}: ${(error as Error).message}`,
      );
      return 0;
    }
  }
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatDateUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDaysUTC(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function buildMonthKeys(months: number): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    keys.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
    );
  }
  return keys;
}
