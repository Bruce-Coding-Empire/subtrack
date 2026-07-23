import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { UsersModule } from '@/modules/users/users.module';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { RenewalJob } from './renewal.job';
import { ExchangeRateJob } from './exchange-rate.job';
import { NotificationDispatchJob } from './notification-dispatch.job';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Subscription, PaymentHistory]),
    CurrencyModule,
    UsersModule,
    DashboardModule,
    NotificationsModule,
  ],
  providers: [RenewalJob, ExchangeRateJob, NotificationDispatchJob],
  exports: [RenewalJob, ExchangeRateJob, NotificationDispatchJob],
})
export class SchedulerModule {}
