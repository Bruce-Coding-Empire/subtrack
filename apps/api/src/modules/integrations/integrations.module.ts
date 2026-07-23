import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConnection } from './entities/email-connection.entity';
import { GmailIntegrationController } from './gmail-integration.controller';
import { GmailIntegrationService } from './gmail-integration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailConnection]),
    JwtModule.register({}),
  ],
  controllers: [GmailIntegrationController],
  providers: [GmailIntegrationService],
})
export class IntegrationsModule {}
