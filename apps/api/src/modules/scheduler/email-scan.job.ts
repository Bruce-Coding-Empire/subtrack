import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { GmailApiService } from '@/modules/integrations/gmail-api.service';
import { EmailConnection } from '@/modules/integrations/entities/email-connection.entity';
import { DetectedSubscription } from '@/modules/integrations/entities/detected-subscription.entity';
import { parseSubscriptionDetails } from '@/common/utils/email-parser.util';

export type EmailScanJobSummary = {
  detected: number;
  skipped: number;
  failedConnections: number;
  connections: number;
};

@Injectable()
export class EmailScanJob {
  private readonly logger = new Logger(EmailScanJob.name);

  constructor(
    @InjectRepository(EmailConnection)
    private readonly connectionRepo: Repository<EmailConnection>,
    @InjectRepository(DetectedSubscription)
    private readonly detectedRepo: Repository<DetectedSubscription>,
    private readonly gmailApiService: GmailApiService,
  ) {}

  @Cron('0 1 * * *') // daily at 01:00 server time — independent of renewal.job.ts/notification-dispatch.job.ts, just spaced out to avoid overlap
  async scan(): Promise<EmailScanJobSummary> {
    this.logger.log('Email scan job started');

    const connections = await this.connectionRepo.find({
      where: { provider: 'gmail' },
    });

    let detected = 0;
    let skipped = 0;
    let failedConnections = 0;

    for (const connection of connections) {
      try {
        const messages =
          await this.gmailApiService.fetchCandidateMessages(connection);

        for (const message of messages) {
          const existing = await this.detectedRepo.findOne({
            where: { userId: connection.userId, gmailMessageId: message.id },
          });
          if (existing) {
            skipped++;
            continue;
          }

          const parsed = parseSubscriptionDetails({
            fromHeader: message.fromHeader,
            subject: message.subject,
            snippet: message.snippet,
          });

          await this.detectedRepo.save(
            this.detectedRepo.create({
              userId: connection.userId,
              gmailMessageId: message.id,
              vendorName: parsed.vendorName,
              amount: parsed.amount,
              currency: parsed.currency,
              billingCycle: parsed.billingCycle,
              rawSubject: message.subject,
              receivedAt: message.receivedAt,
              status: 'pending',
            }),
          );
          detected++;
        }
      } catch (error) {
        failedConnections++;
        this.logger.error(
          `Failed to scan Gmail for user ${connection.userId}`,
          error,
        );
      }
    }

    this.logger.log(
      `Email scan job completed — ${detected} new detected subscriptions, ${skipped} already seen, ${failedConnections}/${connections.length} connections failed`,
    );

    return {
      detected,
      skipped,
      failedConnections,
      connections: connections.length,
    };
  }
}
