import { User } from '@/modules/users/entities/user.entity';
import { NotificationPreference } from '@/modules/users/entities/notification-preference.entity';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';
import { ExchangeRate } from '@/modules/currency/entities/exchange-rate.entity';

export const entities = [
  User,
  NotificationPreference,
  Subscription,
  PaymentHistory,
  ExchangeRate,
];
