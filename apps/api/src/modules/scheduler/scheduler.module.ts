import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { RenewalJob } from './renewal.job';
import { ExchangeRateJob } from './exchange-rate.job';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Subscription, PaymentHistory]),
    CurrencyModule,
  ],
  providers: [RenewalJob, ExchangeRateJob],
  exports: [RenewalJob, ExchangeRateJob],
})
export class SchedulerModule {}
