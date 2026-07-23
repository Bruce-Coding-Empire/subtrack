import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { calculateNextRenewalDate } from '@/common/utils/billing-cycle.util';
import { Subscription } from './entities/subscription.entity';
import { PaymentHistory } from './entities/payment-history.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { QuerySubscriptionsDto } from './dto/query-subscriptions.dto';

export type SubscriptionResponse = {
  id: string;
  name: string;
  cost: number;
  currency: string;
  billingCycle: Subscription['billingCycle'];
  customIntervalDays: number | null;
  category: Subscription['category'];
  status: Subscription['status'];
  startDate: string;
  nextRenewalDate: string;
};

type PaymentHistoryResponse = {
  id: string;
  amount: number;
  currency: string;
  paidAt: string;
};

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepo: Repository<PaymentHistory>,
  ) {}

  async create(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponse> {
    try {
      const nextRenewalDate = this.resolveNextRenewalDate(
        dto.startDate,
        dto.billingCycle,
        dto.customIntervalDays ?? null,
      );

      const subscription = this.subscriptionRepo.create({
        name: dto.name,
        cost: dto.cost,
        currency: dto.currency,
        billingCycle: dto.billingCycle,
        customIntervalDays: dto.customIntervalDays ?? null,
        category: dto.category,
        startDate: dto.startDate,
        userId,
        nextRenewalDate,
        status: 'active',
      });

      const saved = await this.subscriptionRepo.save(subscription);
      return this.toResponse(saved);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async findAll(
    userId: string,
    query: QuerySubscriptionsDto,
  ): Promise<{
    items: SubscriptionResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const qb = this.subscriptionRepo
        .createQueryBuilder('subscription')
        .where('subscription.userId = :userId', { userId });

      if (query.status) {
        qb.andWhere('subscription.status = :status', {
          status: query.status,
        });
      }
      if (query.search) {
        qb.andWhere('subscription.name ILIKE :search', {
          search: `%${query.search}%`,
        });
      }

      const [items, total] = await qb
        .orderBy('subscription.nextRenewalDate', 'ASC')
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getManyAndCount();

      return {
        items: items.map((item) => this.toResponse(item)),
        total,
        page: query.page,
        limit: query.limit,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch subscriptions');
    }
  }

  async findOne(
    userId: string,
    id: string,
  ): Promise<
    SubscriptionResponse & { paymentHistory: PaymentHistoryResponse[] }
  > {
    try {
      const subscription = await this.findOwnedOrThrow(userId, id);
      const paymentHistory = await this.paymentHistoryRepo.find({
        where: { subscriptionId: id, userId },
        order: { paidAt: 'DESC' },
      });

      return {
        ...this.toResponse(subscription),
        paymentHistory: paymentHistory.map((entry) =>
          this.toPaymentHistoryResponse(entry),
        ),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch subscription');
    }
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionResponse> {
    try {
      const subscription = await this.findOwnedOrThrow(userId, id);

      const billingCycle = dto.billingCycle ?? subscription.billingCycle;
      const customIntervalDays =
        dto.customIntervalDays !== undefined
          ? dto.customIntervalDays
          : subscription.customIntervalDays;
      const startDate = dto.startDate ?? subscription.startDate;

      Object.assign(subscription, dto);

      if (dto.billingCycle !== undefined || dto.startDate !== undefined) {
        subscription.nextRenewalDate = this.resolveNextRenewalDate(
          startDate,
          billingCycle,
          customIntervalDays,
        );
      }

      const saved = await this.subscriptionRepo.save(subscription);
      return this.toResponse(saved);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update subscription');
    }
  }

  async cancel(userId: string, id: string): Promise<SubscriptionResponse> {
    try {
      const subscription = await this.findOwnedOrThrow(userId, id);
      subscription.status = 'cancelled';
      const saved = await this.subscriptionRepo.save(subscription);
      return this.toResponse(saved);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    try {
      const subscription = await this.findOwnedOrThrow(userId, id);
      const paymentCount = await this.paymentHistoryRepo.count({
        where: { subscriptionId: subscription.id },
      });
      if (paymentCount > 0) {
        throw new BadRequestException(
          'This subscription has payment history and cannot be deleted — cancel it instead',
        );
      }
      await this.subscriptionRepo.remove(subscription);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete subscription');
    }
  }

  private async findOwnedOrThrow(
    userId: string,
    id: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id, userId },
    });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  private resolveNextRenewalDate(
    startDate: string,
    billingCycle: Subscription['billingCycle'],
    customIntervalDays: number | null,
  ): string {
    if (billingCycle === 'custom' && !customIntervalDays) {
      throw new BadRequestException(
        'customIntervalDays is required when billingCycle is custom',
      );
    }
    return calculateNextRenewalDate(
      startDate,
      billingCycle,
      customIntervalDays,
    );
  }

  private toResponse(subscription: Subscription): SubscriptionResponse {
    return {
      id: subscription.id,
      name: subscription.name,
      cost: subscription.cost,
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      customIntervalDays: subscription.customIntervalDays,
      category: subscription.category,
      status: subscription.status,
      startDate: subscription.startDate,
      nextRenewalDate: subscription.nextRenewalDate,
    };
  }

  private toPaymentHistoryResponse(
    entry: PaymentHistory,
  ): PaymentHistoryResponse {
    return {
      id: entry.id,
      amount: entry.amount,
      currency: entry.currency,
      paidAt: entry.paidAt,
    };
  }
}
