import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { LessThanOrEqual, Repository } from 'typeorm';
import { calculateNextRenewalDate } from '@/common/utils/billing-cycle.util';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class RenewalJob {
  private readonly logger = new Logger(RenewalJob.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepo: Repository<PaymentHistory>,
  ) {}

  @Cron('5 0 * * *') // daily at 00:05 server time
  async handleRenewals(): Promise<void> {
    this.logger.log('Renewal job started');

    const due = await this.subscriptionRepo.find({
      where: { status: 'active', nextRenewalDate: LessThanOrEqual(today()) },
    });

    let renewedCount = 0;
    for (const subscription of due) {
      try {
        await this.paymentHistoryRepo.save(
          this.paymentHistoryRepo.create({
            subscriptionId: subscription.id,
            userId: subscription.userId,
            amount: subscription.cost,
            currency: subscription.currency,
            paidAt: today(),
          }),
        );

        subscription.nextRenewalDate = calculateNextRenewalDate(
          subscription.nextRenewalDate,
          subscription.billingCycle,
          subscription.customIntervalDays,
        );
        await this.subscriptionRepo.save(subscription);
        renewedCount++;
      } catch (error) {
        this.logger.error(
          `Failed to renew subscription ${subscription.id}`,
          error,
        );
      }
    }

    this.logger.log(
      `Renewal job completed — ${renewedCount}/${due.length} subscriptions renewed`,
    );
  }
}
