import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';
import { EmailConnection } from '@/modules/integrations/entities/email-connection.entity';
import { DetectedSubscription } from '@/modules/integrations/entities/detected-subscription.entity';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { UsersModule } from '@/modules/users/users.module';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { IntegrationsModule } from '@/modules/integrations/integrations.module';
import { RenewalJob } from './renewal.job';
import { ExchangeRateJob } from './exchange-rate.job';
import { NotificationDispatchJob } from './notification-dispatch.job';
import { EmailScanJob } from './email-scan.job';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Subscription,
      PaymentHistory,
      EmailConnection,
      DetectedSubscription,
    ]),
    CurrencyModule,
    UsersModule,
    DashboardModule,
    NotificationsModule,
    IntegrationsModule,
  ],
  providers: [
    RenewalJob,
    ExchangeRateJob,
    NotificationDispatchJob,
    EmailScanJob,
  ],
  exports: [RenewalJob, ExchangeRateJob, NotificationDispatchJob, EmailScanJob],
})
export class SchedulerModule {}
