import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsModule } from '@/modules/subscriptions/subscriptions.module';
import { EmailConnection } from './entities/email-connection.entity';
import { DetectedSubscription } from './entities/detected-subscription.entity';
import { GmailIntegrationController } from './gmail-integration.controller';
import { GmailIntegrationService } from './gmail-integration.service';
import { GmailApiService } from './gmail-api.service';
import { DetectedSubscriptionsController } from './detected-subscriptions.controller';
import { DetectedSubscriptionsService } from './detected-subscriptions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailConnection, DetectedSubscription]),
    JwtModule.register({}),
    SubscriptionsModule,
  ],
  controllers: [GmailIntegrationController, DetectedSubscriptionsController],
  providers: [
    GmailIntegrationService,
    GmailApiService,
    DetectedSubscriptionsService,
  ],
  exports: [GmailApiService],
})
export class IntegrationsModule {}
