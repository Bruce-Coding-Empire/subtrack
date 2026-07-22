import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { CurrencyService } from './currency.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRate, Subscription])],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
