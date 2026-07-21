import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/modules/users/entities/user.entity';
import {
  BillingCycle,
  Subscription,
  SubscriptionCategory,
} from '@/modules/subscriptions/entities/subscription.entity';

const SEED_USER_EMAIL = 'test@subtrack.dev';

type SeedSubscription = {
  name: string;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  customIntervalDays: number | null;
  category: SubscriptionCategory;
  startDate: string;
  nextRenewalDate: string;
};

const seedSubscriptions: SeedSubscription[] = [
  {
    name: 'Netflix',
    cost: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'entertainment',
    startDate: '2026-01-15',
    nextRenewalDate: '2026-08-15',
  },
  {
    name: 'Spotify',
    cost: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'entertainment',
    startDate: '2025-11-05',
    nextRenewalDate: '2026-08-05',
  },
  {
    name: 'GitHub Copilot',
    cost: 10.0,
    currency: 'USD',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'software',
    startDate: '2026-03-10',
    nextRenewalDate: '2026-07-25',
  },
  {
    name: 'Planet Fitness',
    cost: 24.99,
    currency: 'USD',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'fitness',
    startDate: '2026-02-01',
    nextRenewalDate: '2026-08-01',
  },
  {
    name: 'REG Electricity',
    cost: 45000,
    currency: 'RWF',
    billingCycle: 'monthly',
    customIntervalDays: null,
    category: 'utilities',
    startDate: '2026-06-01',
    nextRenewalDate: '2026-07-28',
  },
  {
    name: 'Domain Renewal',
    cost: 12.0,
    currency: 'USD',
    billingCycle: 'yearly',
    customIntervalDays: null,
    category: 'other',
    startDate: '2025-08-01',
    nextRenewalDate: '2026-08-01',
  },
  {
    name: 'Cloud Backup',
    cost: 8.5,
    currency: 'EUR',
    billingCycle: 'custom',
    customIntervalDays: 45,
    category: 'software',
    startDate: '2026-06-10',
    nextRenewalDate: '2026-07-25',
  },
];

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const subscriptionRepo = AppDataSource.getRepository(Subscription);

  const existing = await userRepo.findOne({ where: { email: SEED_USER_EMAIL } });
  if (existing) {
    await subscriptionRepo.delete({ userId: existing.id });
    await userRepo.delete({ id: existing.id });
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user = await userRepo.save(
    userRepo.create({
      email: SEED_USER_EMAIL,
      name: 'Test User',
      passwordHash,
      baseCurrency: 'RWF',
    }),
  );

  await subscriptionRepo.save(
    seedSubscriptions.map((subscription) =>
      subscriptionRepo.create({ ...subscription, userId: user.id, status: 'active' }),
    ),
  );

  console.log(`Seeded user ${user.email} with ${seedSubscriptions.length} subscriptions.`);
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('[seed] Failed to seed database', error);
  process.exit(1);
});
