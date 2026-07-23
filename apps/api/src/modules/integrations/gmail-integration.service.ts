import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import { encrypt } from '@/common/utils/encryption.util';
import { EmailConnection } from './entities/email-connection.entity';

const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const STATE_PURPOSE = 'gmail_oauth_state';
const STATE_EXPIRY = '10m';
const PROVIDER = 'gmail';

@Injectable()
export class GmailIntegrationService {
  private readonly logger = new Logger(GmailIntegrationService.name);
  private readonly oauth2Client: OAuth2Client;

  constructor(
    @InjectRepository(EmailConnection)
    private readonly connectionRepo: Repository<EmailConnection>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.oauth2Client = new OAuth2Client({
      clientId: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.getOrThrow<string>(
        'GOOGLE_CLIENT_SECRET',
      ),
      redirectUri: this.configService.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
    });
  }

  getConsentUrl(userId: string): string {
    const state = this.jwtService.sign(
      { sub: userId, purpose: STATE_PURPOSE },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: STATE_EXPIRY,
      },
    );

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [GMAIL_READONLY_SCOPE],
      state,
    });
  }

  async handleCallback(code: string, state: string): Promise<void> {
    const userId = this.verifyState(state);

    let tokens: { access_token?: string | null; refresh_token?: string | null };
    try {
      ({ tokens } = await this.oauth2Client.getToken(code));
    } catch (error) {
      this.logger.error(
        '[GmailIntegrationService.handleCallback] Token exchange failed',
        error,
      );
      throw new BadRequestException('Failed to connect Gmail');
    }

    if (!tokens.access_token) {
      throw new BadRequestException('Google did not return an access token');
    }

    const encryptionKey = this.configService.getOrThrow<string>(
      'TOKEN_ENCRYPTION_KEY',
    );
    const accessTokenEncrypted = encrypt(tokens.access_token, encryptionKey);
    const refreshTokenEncrypted = tokens.refresh_token
      ? encrypt(tokens.refresh_token, encryptionKey)
      : null;

    try {
      const existing = await this.connectionRepo.findOne({
        where: { userId, provider: PROVIDER },
      });

      if (existing) {
        existing.accessTokenEncrypted = accessTokenEncrypted;
        if (refreshTokenEncrypted) {
          existing.refreshTokenEncrypted = refreshTokenEncrypted;
        }
        await this.connectionRepo.save(existing);
        return;
      }

      const connection = this.connectionRepo.create({
        userId,
        provider: PROVIDER,
        accessTokenEncrypted,
        refreshTokenEncrypted,
      });
      await this.connectionRepo.save(connection);
    } catch (error) {
      this.logger.error(
        '[GmailIntegrationService.handleCallback] Failed to store connection',
        error,
      );
      throw new InternalServerErrorException('Failed to save Gmail connection');
    }
  }

  async disconnect(userId: string): Promise<void> {
    try {
      await this.connectionRepo.delete({ userId, provider: PROVIDER });
    } catch (error) {
      this.logger.error('[GmailIntegrationService.disconnect] Failed', error);
      throw new InternalServerErrorException('Failed to disconnect Gmail');
    }
  }

  private verifyState(state: string): string {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        purpose: string;
      }>(state, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      if (payload.purpose !== STATE_PURPOSE) {
        throw new Error('Unexpected state token purpose');
      }
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired connection request');
    }
  }
}
