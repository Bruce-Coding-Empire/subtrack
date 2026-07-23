import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { UsersModule } from '@/modules/users/users.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, PaymentHistory]),
    CurrencyModule,
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
