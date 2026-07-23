import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConnection } from './entities/email-connection.entity';
import { DetectedSubscription } from './entities/detected-subscription.entity';
import { GmailIntegrationController } from './gmail-integration.controller';
import { GmailIntegrationService } from './gmail-integration.service';
import { GmailApiService } from './gmail-api.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailConnection, DetectedSubscription]),
    JwtModule.register({}),
  ],
  controllers: [GmailIntegrationController],
  providers: [GmailIntegrationService, GmailApiService],
  exports: [GmailApiService],
})
export class IntegrationsModule {}
