import { User } from '@/modules/users/entities/user.entity';
import { NotificationPreference } from '@/modules/notifications/entities/notification-preference.entity';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';
import { ExchangeRate } from '@/modules/currency/entities/exchange-rate.entity';
import { EmailConnection } from '@/modules/integrations/entities/email-connection.entity';
import { DetectedSubscription } from '@/modules/integrations/entities/detected-subscription.entity';

export const entities = [
  User,
  NotificationPreference,
  Subscription,
  PaymentHistory,
  ExchangeRate,
  EmailConnection,
  DetectedSubscription,
];
