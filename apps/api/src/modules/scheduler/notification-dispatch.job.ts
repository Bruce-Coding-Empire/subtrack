import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Between, Repository } from 'typeorm';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';
import { CurrencyService } from '@/modules/currency/currency.service';
import { UsersService } from '@/modules/users/users.service';
import { DashboardService } from '@/modules/dashboard/dashboard.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { NotificationPreference } from '@/modules/notifications/entities/notification-preference.entity';

const REMINDER_WINDOW_DAYS = 3;

export type NotificationDispatchJobSummary = {
  remindersQueued: number;
  alertsQueued: number;
  sent: number;
  failures: number;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class NotificationDispatchJob {
  private readonly logger = new Logger(NotificationDispatchJob.name);
  private readonly expo = new Expo();

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly currencyService: CurrencyService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Cron('15 0 * * *') // daily at 00:15 server time, after renewal.job.ts's 00:05 run
  async dispatch(): Promise<NotificationDispatchJobSummary> {
    this.logger.log('Notification dispatch job started');

    const messages: ExpoPushMessage[] = [];
    let remindersQueued = 0;
    let alertsQueued = 0;
    let failed = 0;

    const reminderRecipients =
      await this.notificationsService.findRenewalReminderRecipients();
    for (const preference of reminderRecipients) {
      const pushToken = preference.pushToken;
      if (!pushToken || !Expo.isExpoPushToken(pushToken)) continue;

      try {
        const upcoming = await this.findUpcomingRenewals(preference.userId);
        for (const subscription of upcoming) {
          messages.push(this.buildReminderMessage(pushToken, subscription));
          remindersQueued++;
        }
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to build renewal reminders for user ${preference.userId}`,
          error,
        );
      }
    }

    const alertRecipients =
      await this.notificationsService.findSpendLimitAlertRecipients();
    for (const preference of alertRecipients) {
      try {
        const message = await this.buildSpendLimitAlert(preference);
        if (message) {
          messages.push(message);
          alertsQueued++;
        }
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to evaluate spend-limit alert for user ${preference.userId}`,
          error,
        );
      }
    }

    const { sent, failed: sendFailed } = await this.sendMessages(messages);
    failed += sendFailed;

    this.logger.log(
      `Notification dispatch job completed — ${remindersQueued} renewal reminders and ${alertsQueued} spend-limit alerts queued, ${sent} pushes sent, ${failed} failures`,
    );

    return { remindersQueued, alertsQueued, sent, failures: failed };
  }

  private async findUpcomingRenewals(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepo.find({
      where: {
        userId,
        status: 'active',
        nextRenewalDate: Between(
          today(),
          addDays(today(), REMINDER_WINDOW_DAYS),
        ),
      },
    });
  }

  private buildReminderMessage(
    pushToken: string,
    subscription: Subscription,
  ): ExpoPushMessage {
    return {
      to: pushToken,
      sound: 'default',
      title: 'Upcoming renewal',
      body: `${subscription.name} renews on ${subscription.nextRenewalDate} for ${subscription.cost} ${subscription.currency}`,
      data: { type: 'renewal-reminder', subscriptionId: subscription.id },
    };
  }

  private async buildSpendLimitAlert(
    preference: NotificationPreference,
  ): Promise<ExpoPushMessage | null> {
    const pushToken = preference.pushToken;
    if (!pushToken || !Expo.isExpoPushToken(pushToken)) return null;

    const user = await this.usersService.findById(preference.userId);
    if (!user || user.monthlySpendLimit === null) return null;

    const upcoming = await this.findUpcomingRenewals(preference.userId);
    if (upcoming.length === 0) return null;

    const currentMonthSpend = await this.dashboardService.getCurrentMonthSpend(
      preference.userId,
      user.baseCurrency,
    );

    let projectedSpend = currentMonthSpend;
    for (const subscription of upcoming) {
      projectedSpend += await this.currencyService.getConvertedAmount(
        subscription.cost,
        subscription.currency,
        user.baseCurrency,
      );
    }

    if (projectedSpend <= user.monthlySpendLimit) return null;

    return {
      to: pushToken,
      sound: 'default',
      title: 'Approaching your spend limit',
      body: `Upcoming renewals will bring this month's spend to ${projectedSpend.toFixed(2)} ${user.baseCurrency}, over your ${user.monthlySpendLimit} ${user.baseCurrency} limit`,
      data: { type: 'spend-limit-alert' },
    };
  }

  private async sendMessages(
    messages: ExpoPushMessage[],
  ): Promise<{ sent: number; failed: number }> {
    if (messages.length === 0) return { sent: 0, failed: 0 };

    let sent = 0;
    let failed = 0;
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        for (const ticket of tickets) {
          if (ticket.status === 'ok') {
            sent++;
          } else {
            failed++;
            this.logger.error(
              `Push notification ticket error: ${ticket.message}`,
            );
          }
        }
      } catch (error) {
        failed += chunk.length;
        this.logger.error('Failed to send a push notification chunk', error);
      }
    }

    return { sent, failed };
  }
}
