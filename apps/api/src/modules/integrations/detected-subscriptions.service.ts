import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SubscriptionResponse,
  SubscriptionsService,
} from '@/modules/subscriptions/subscriptions.service';
import { DetectedSubscription } from './entities/detected-subscription.entity';
import { ApproveDetectedSubscriptionDto } from './dto/approve-detected-subscription.dto';

export type DetectedSubscriptionResponse = {
  id: string;
  vendorName: string | null;
  amount: number | null;
  currency: string | null;
  billingCycle: DetectedSubscription['billingCycle'];
  rawSubject: string;
  receivedAt: string | null;
  status: DetectedSubscription['status'];
  detectedAt: string;
};

@Injectable()
export class DetectedSubscriptionsService {
  constructor(
    @InjectRepository(DetectedSubscription)
    private readonly detectedRepo: Repository<DetectedSubscription>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findAllPending(
    userId: string,
  ): Promise<DetectedSubscriptionResponse[]> {
    try {
      const items = await this.detectedRepo.find({
        where: { userId, status: 'pending' },
        order: { detectedAt: 'DESC' },
      });
      return items.map((item) => this.toResponse(item));
    } catch {
      throw new InternalServerErrorException(
        'Failed to fetch detected subscriptions',
      );
    }
  }

  async approve(
    userId: string,
    id: string,
    dto: ApproveDetectedSubscriptionDto,
  ): Promise<SubscriptionResponse> {
    const detected = await this.findOwnedPendingOrThrow(userId, id);

    try {
      const subscription = await this.subscriptionsService.create(userId, dto);
      detected.status = 'approved';
      await this.detectedRepo.save(detected);
      return subscription;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to approve detected subscription',
      );
    }
  }

  async dismiss(userId: string, id: string): Promise<void> {
    const detected = await this.findOwnedPendingOrThrow(userId, id);

    try {
      detected.status = 'dismissed';
      await this.detectedRepo.save(detected);
    } catch {
      throw new InternalServerErrorException(
        'Failed to dismiss detected subscription',
      );
    }
  }

  private async findOwnedPendingOrThrow(
    userId: string,
    id: string,
  ): Promise<DetectedSubscription> {
    const detected = await this.detectedRepo.findOne({ where: { id, userId } });
    if (!detected || detected.status !== 'pending') {
      throw new NotFoundException('Detected subscription not found');
    }
    return detected;
  }

  private toResponse(item: DetectedSubscription): DetectedSubscriptionResponse {
    return {
      id: item.id,
      vendorName: item.vendorName,
      amount: item.amount,
      currency: item.currency,
      billingCycle: item.billingCycle,
      rawSubject: item.rawSubject,
      receivedAt: item.receivedAt ? item.receivedAt.toISOString() : null,
      status: item.status,
      detectedAt: item.detectedAt.toISOString(),
    };
  }
}
