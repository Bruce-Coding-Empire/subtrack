import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { PaymentHistory } from '@/modules/subscriptions/entities/payment-history.entity';

export type SubscriptionExportRow = {
  name: string;
  category: string;
  cost: number;
  currency: string;
  billingCycle: string;
  customIntervalDays: number | null;
  status: string;
  startDate: string;
  nextRenewalDate: string;
};

export type PaymentHistoryExportRow = {
  subscriptionName: string;
  amount: number;
  currency: string;
  paidAt: string;
};

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepo: Repository<PaymentHistory>,
  ) {}

  async getSubscriptionsRows(userId: string): Promise<SubscriptionExportRow[]> {
    const subscriptions = await this.subscriptionRepo.find({
      where: { userId },
      order: { nextRenewalDate: 'ASC' },
    });

    return subscriptions.map((subscription) => ({
      name: subscription.name,
      category: subscription.category,
      cost: subscription.cost,
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      customIntervalDays: subscription.customIntervalDays,
      status: subscription.status,
      startDate: subscription.startDate,
      nextRenewalDate: subscription.nextRenewalDate,
    }));
  }

  async getPaymentHistoryRows(
    userId: string,
  ): Promise<PaymentHistoryExportRow[]> {
    const entries = await this.paymentHistoryRepo
      .createQueryBuilder('ph')
      .leftJoin('ph.subscription', 's')
      .addSelect(['s.name'])
      .where('ph.userId = :userId', { userId })
      .orderBy('ph.paidAt', 'DESC')
      .getMany();

    return entries.map((entry) => ({
      subscriptionName: entry.subscription?.name ?? 'Unknown',
      amount: entry.amount,
      currency: entry.currency,
      paidAt: entry.paidAt,
    }));
  }
}
