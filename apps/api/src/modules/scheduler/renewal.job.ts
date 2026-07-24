import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { LessThanOrEqual, Repository } from 'typeorm';
import { calculateCatchUp } from '@/common/utils/renewal-catchup.util';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export type RenewalJobSummary = {
  processed: number;
  paymentsLogged: number;
  failures: number;
};

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
  async handleRenewals(): Promise<RenewalJobSummary> {
    this.logger.log('Renewal job started');

    const due = await this.subscriptionRepo.find({
      where: { status: 'active', nextRenewalDate: LessThanOrEqual(today()) },
    });

    const summary: RenewalJobSummary = {
      processed: 0,
      paymentsLogged: 0,
      failures: 0,
    };

    for (const subscription of due) {
      try {
        // Catch-up loop (feature 34): the job may not run every day — production
        // hosting sleeps, so a subscription can be several cycles overdue. One
        // advance per run would leave it overdue forever and drop history rows.
        // Looping until the renewal date is in the future makes the job correct
        // under irregular scheduling AND idempotent (a same-day second run finds
        // nothing due) — which is what makes the external trigger + in-process
        // cron double-firing in feature 35 safe.
        const { paymentDates, nextRenewalDate, capHit } = calculateCatchUp(
          subscription,
          today(),
        );

        for (const paidAt of paymentDates) {
          await this.paymentHistoryRepo.save(
            this.paymentHistoryRepo.create({
              subscriptionId: subscription.id,
              userId: subscription.userId,
              amount: subscription.cost,
              currency: subscription.currency,
              // The due date being processed, NOT today(): backfilled payments must
              // land in the month they notionally happened, or the spend-trend chart
              // attributes several cycles of spend to whichever month caught up.
              paidAt,
            }),
          );
        }

        subscription.nextRenewalDate = nextRenewalDate;
        await this.subscriptionRepo.save(subscription);

        summary.processed++;
        summary.paymentsLogged += paymentDates.length;

        if (capHit) {
          // Defense in depth: DTO validation forbids customIntervalDays < 1, but an
          // unbounded while over persisted data still deserves a ceiling. Still
          // overdue after the cap — the next run picks this subscription back up.
          this.logger.error(
            `[RenewalJob] catch-up cap hit for subscription ${subscription.id}`,
          );
        }
      } catch (error) {
        summary.failures++;
        this.logger.error(
          `Failed to renew subscription ${subscription.id}`,
          error,
        );
      }
    }

    this.logger.log(
      `Renewal job completed — processed ${summary.processed}/${due.length}, ` +
        `${summary.paymentsLogged} payments logged, ${summary.failures} failures`,
    );

    return summary;
  }
}
