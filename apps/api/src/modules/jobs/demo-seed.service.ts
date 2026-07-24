import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/modules/users/entities/user.entity';
import {
  BillingCycle,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
} from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';
import { DetectedSubscription } from '@/modules/integrations/entities/detected-subscription.entity';
import { NotificationPreference } from '@/modules/notifications/entities/notification-preference.entity';
import { CurrencyService } from '@/modules/currency/currency.service';

// All dates are relative to run time so the demo always looks current instead
// of decaying as the seed ages — "renews in 5 days", "paid 3 days ago".
function isoDaysFromNow(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isoMonthsBefore(dateStr: string, months: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.toISOString().slice(0, 10);
}

function isoDaysBefore(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

type DemoSubscription = {
  name: string;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  customIntervalDays: number | null;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  // Positive = renews in N days (active), negative = last cycle N days ago
  // (cancelled subs keep the stale date the renewal job stopped advancing).
  renewalInDays: number;
  historyCount: number;
};

// Mixed currencies, categories, and cycles on purpose: the demo user is the
// only account most reviewers ever see, so every feature the dashboard and
// subscriptions pages can render must be visible from this data alone —
// urgency pills (two renewals inside 7 days), the cancelled filter, multi-month
// spend trend, and multi-currency conversion.
const demoSubscriptions: DemoSubscription[] = [
  {
    name: 'Netflix',
    cost: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'entertainment',
    status: 'active',
    renewalInDays: 12,
    historyCount: 6,
  },
  {
    name: 'Spotify',
    cost: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'entertainment',
    status: 'active',
    renewalInDays: 3,
    historyCount: 6,
  },
  {
    name: 'GitHub Copilot',
    cost: 10.0,
    currency: 'USD',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'software',
    status: 'active',
    renewalInDays: 20,
    historyCount: 5,
  },
  {
    name: 'FlexFit Gym',
    cost: 24.99,
    currency: 'USD',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'fitness',
    status: 'active',
    renewalInDays: 6,
    historyCount: 5,
  },
  {
    name: 'REG Electricity',
    cost: 45000,
    currency: 'RWF',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'utilities',
    status: 'active',
    renewalInDays: 9,
    historyCount: 4,
  },
  {
    name: 'iCloud+',
    cost: 2.99,
    currency: 'EUR',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'software',
    status: 'active',
    renewalInDays: 15,
    historyCount: 6,
  },
  {
    name: 'ProtonVPN',
    cost: 5.49,
    currency: 'USD',
    billingCycle: 'custom',
    customIntervalDays: 30,
    category: 'software',
    status: 'active',
    renewalInDays: 25,
    historyCount: 3,
  },
  {
    name: 'Coworking Day Pass',
    cost: 6.0,
    currency: 'USD',
    billingCycle: 'weekly',
    customIntervalDays: null,
    category: 'other',
    status: 'active',
    renewalInDays: 2,
    historyCount: 8,
  },
  {
    name: 'Domain Renewal',
    cost: 12.0,
    currency: 'USD',
    billingCycle: 'yearly',
    customIntervalDays: null,
    category: 'other',
    status: 'active',
    renewalInDays: 80,
    historyCount: 1,
  },
  {
    name: 'Hulu',
    cost: 7.99,
    currency: 'USD',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'entertainment',
    status: 'cancelled',
    renewalInDays: -61,
    historyCount: 3,
  },
];

function paymentDatesFor(
  spec: DemoSubscription,
  renewalDate: string,
): string[] {
  const intervalDays =
    spec.billingCycle === 'weekly'
      ? 7
      : spec.billingCycle === 'custom'
        ? (spec.customIntervalDays ?? 30)
        : null;

  const dates: string[] = [];
  for (let k = 1; k <= spec.historyCount; k++) {
    if (intervalDays !== null) {
      dates.push(isoDaysBefore(renewalDate, intervalDays * k));
    } else if (spec.billingCycle === 'yearly') {
      dates.push(isoMonthsBefore(renewalDate, 12 * k));
    } else {
      dates.push(isoMonthsBefore(renewalDate, k));
    }
  }
  return dates;
}

@Injectable()
export class DemoSeedService {
  private readonly logger = new Logger(DemoSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly currencyService: CurrencyService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepo: Repository<PaymentHistory>,
    @InjectRepository(DetectedSubscription)
    private readonly detectedRepo: Repository<DetectedSubscription>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepo: Repository<NotificationPreference>,
  ) {}

  async reset(): Promise<{ reset: boolean }> {
    const email = this.configService.get<string>('DEMO_USER_EMAIL');
    const password = this.configService.get<string>('DEMO_USER_PASSWORD');
    if (!email || !password) {
      throw new Error(
        '[DemoSeedService.reset] DEMO_USER_EMAIL / DEMO_USER_PASSWORD not configured',
      );
    }

    this.logger.log('Demo account reset started');

    const user = await this.upsertDemoUser(email, password);
    await this.wipeDemoData(user.id);
    const { subscriptions, payments } = await this.seedSubscriptions(user.id);
    await this.seedDetectedSubscriptions(user.id);
    await this.seedNotificationPreferences(user.id);

    // The demo data introduces currencies (EUR/RWF) that may have no cached
    // rate yet on a fresh deployment — without this, the dashboard's converted
    // totals would 500 until the next exchange-rate job run. Failure-tolerant:
    // a down FX API degrades the demo, it must not fail the reset.
    try {
      await this.currencyService.refreshAndCache();
    } catch (error) {
      this.logger.error(
        '[DemoSeedService.reset] exchange rate refresh failed — demo seeded, conversions may lag',
        error,
      );
    }

    this.logger.log(
      `Demo account reset completed — ${subscriptions} subscriptions, ${payments} payments reseeded for ${email}`,
    );

    return { reset: true };
  }

  // The user row (and its id) survives resets — only its data is wiped — so a
  // reviewer's open demo session isn't invalidated mid-browse by the nightly job.
  private async upsertDemoUser(email: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await this.userRepo.findOne({ where: { email } });

    if (existing) {
      existing.name = 'Demo User';
      existing.passwordHash = passwordHash;
      existing.baseCurrency = 'USD';
      existing.monthlySpendLimit = 180;
      return this.userRepo.save(existing);
    }

    return this.userRepo.save(
      this.userRepo.create({
        email,
        name: 'Demo User',
        passwordHash,
        baseCurrency: 'USD',
        monthlySpendLimit: 180,
      }),
    );
  }

  private async wipeDemoData(userId: string): Promise<void> {
    await this.paymentHistoryRepo.delete({ userId });
    await this.subscriptionRepo.delete({ userId });
    await this.detectedRepo.delete({ userId });
    await this.preferenceRepo.delete({ userId });
  }

  private async seedSubscriptions(
    userId: string,
  ): Promise<{ subscriptions: number; payments: number }> {
    let payments = 0;

    for (const spec of demoSubscriptions) {
      const nextRenewalDate = isoDaysFromNow(spec.renewalInDays);
      const paymentDates = paymentDatesFor(spec, nextRenewalDate);
      const startDate =
        paymentDates.length > 0
          ? paymentDates[paymentDates.length - 1]
          : isoMonthsBefore(nextRenewalDate, 1);

      const subscription = await this.subscriptionRepo.save(
        this.subscriptionRepo.create({
          userId,
          name: spec.name,
          cost: spec.cost,
          currency: spec.currency,
          billingCycle: spec.billingCycle,
          customIntervalDays: spec.customIntervalDays,
          category: spec.category,
          status: spec.status,
          startDate,
          nextRenewalDate,
        }),
      );

      await this.paymentHistoryRepo.save(
        paymentDates.map((paidAt) =>
          this.paymentHistoryRepo.create({
            subscriptionId: subscription.id,
            userId,
            amount: spec.cost,
            currency: spec.currency,
            paidAt,
          }),
        ),
      );
      payments += paymentDates.length;
    }

    return { subscriptions: demoSubscriptions.length, payments };
  }

  // Two pending rows so the Gmail-review UI is visible without a real Gmail
  // connection: one fully parsed, one partial (nulls exercise the review
  // dialog's fill-in-the-blanks path). Synthetic gmailMessageIds — the unique
  // (userId, gmailMessageId) constraint never collides with real scans because
  // the demo user has no email connection.
  private async seedDetectedSubscriptions(userId: string): Promise<void> {
    await this.detectedRepo.save([
      this.detectedRepo.create({
        userId,
        gmailMessageId: 'demo-detected-notion',
        vendorName: 'Notion',
        amount: 12.0,
        currency: 'USD',
        billingCycle: 'monthly',
        rawSubject: 'Your Notion invoice — $12.00',
        receivedAt: new Date(`${isoDaysFromNow(-2)}T09:15:00Z`),
        status: 'pending',
      }),
      this.detectedRepo.create({
        userId,
        gmailMessageId: 'demo-detected-medium',
        vendorName: 'Medium',
        amount: null,
        currency: null,
        billingCycle: null,
        rawSubject: 'Receipt for your Medium membership',
        receivedAt: new Date(`${isoDaysFromNow(-5)}T17:40:00Z`),
        status: 'pending',
      }),
    ]);
  }

  // Toggles on so Settings looks lived-in; pushToken stays null so the
  // dispatch job never queues real pushes for the demo account.
  private async seedNotificationPreferences(userId: string): Promise<void> {
    await this.preferenceRepo.save(
      this.preferenceRepo.create({
        userId,
        renewalRemindersEnabled: true,
        spendLimitAlertsEnabled: true,
        pushToken: null,
      }),
    );
  }
}
