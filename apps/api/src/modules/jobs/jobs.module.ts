import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { User } from '@/modules/users/entities/user.entity';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';
import { DetectedSubscription } from '@/modules/integrations/entities/detected-subscription.entity';
import { NotificationPreference } from '@/modules/notifications/entities/notification-preference.entity';
import { JobsController } from './jobs.controller';
import { DemoSeedService } from './demo-seed.service';

@Module({
  imports: [
    SchedulerModule,
    CurrencyModule,
    TypeOrmModule.forFeature([
      User,
      Subscription,
      PaymentHistory,
      DetectedSubscription,
      NotificationPreference,
    ]),
  ],
  controllers: [JobsController],
  providers: [DemoSeedService],
})
export class JobsModule {}
