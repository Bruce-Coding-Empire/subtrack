import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

export type NotificationPreferencesResponse = {
  renewalRemindersEnabled: boolean;
  spendLimitAlertsEnabled: boolean;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepo: Repository<NotificationPreference>,
  ) {}

  async getPreferences(
    userId: string,
  ): Promise<NotificationPreferencesResponse> {
    const preference = await this.getOrCreate(userId);
    return this.toResponse(preference);
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponse> {
    const preference = await this.getOrCreate(userId);

    try {
      if (dto.renewalRemindersEnabled !== undefined)
        preference.renewalRemindersEnabled = dto.renewalRemindersEnabled;
      if (dto.spendLimitAlertsEnabled !== undefined)
        preference.spendLimitAlertsEnabled = dto.spendLimitAlertsEnabled;
      const saved = await this.preferenceRepo.save(preference);
      return this.toResponse(saved);
    } catch {
      throw new InternalServerErrorException(
        'Failed to update notification preferences',
      );
    }
  }

  async registerPushToken(userId: string, pushToken: string): Promise<void> {
    const preference = await this.getOrCreate(userId);
    if (preference.pushToken === pushToken) return;

    try {
      preference.pushToken = pushToken;
      await this.preferenceRepo.save(preference);
    } catch {
      throw new InternalServerErrorException('Failed to register push token');
    }
  }

  async findRenewalReminderRecipients(): Promise<NotificationPreference[]> {
    return this.preferenceRepo.find({
      where: { renewalRemindersEnabled: true, pushToken: Not(IsNull()) },
    });
  }

  async findSpendLimitAlertRecipients(): Promise<NotificationPreference[]> {
    return this.preferenceRepo.find({
      where: { spendLimitAlertsEnabled: true, pushToken: Not(IsNull()) },
    });
  }

  private async getOrCreate(userId: string): Promise<NotificationPreference> {
    try {
      const existing = await this.preferenceRepo.findOne({ where: { userId } });
      if (existing) return existing;

      const created = this.preferenceRepo.create({ userId });
      return await this.preferenceRepo.save(created);
    } catch {
      throw new InternalServerErrorException(
        'Failed to load notification preferences',
      );
    }
  }

  private toResponse(
    preference: NotificationPreference,
  ): NotificationPreferencesResponse {
    return {
      renewalRemindersEnabled: preference.renewalRemindersEnabled,
      spendLimitAlertsEnabled: preference.spendLimitAlertsEnabled,
    };
  }
}
