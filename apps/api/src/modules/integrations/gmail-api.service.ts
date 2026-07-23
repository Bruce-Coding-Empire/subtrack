import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import { decrypt, encrypt } from '@/common/utils/encryption.util';
import { EmailConnection } from './entities/email-connection.entity';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
// Heuristic subject/body filter — Gmail's own search operators do the
// filtering server-side, so no candidate message needs to be discarded again
// after fetching it.
const SEARCH_QUERY =
  'newer_than:2d (receipt OR invoice OR subscription OR renewal OR renewed OR billing OR "payment confirmation")';
const MAX_RESULTS = 25;

export interface GmailCandidateMessage {
  id: string;
  fromHeader: string;
  subject: string;
  snippet: string;
  receivedAt: Date | null;
}

@Injectable()
export class GmailApiService {
  private readonly logger = new Logger(GmailApiService.name);

  constructor(
    @InjectRepository(EmailConnection)
    private readonly connectionRepo: Repository<EmailConnection>,
    private readonly configService: ConfigService,
  ) {}

  async fetchCandidateMessages(
    connection: EmailConnection,
  ): Promise<GmailCandidateMessage[]> {
    const accessToken = await this.getFreshAccessToken(connection);

    const listUrl = new URL(`${GMAIL_API_BASE}/messages`);
    listUrl.searchParams.set('q', SEARCH_QUERY);
    listUrl.searchParams.set('maxResults', String(MAX_RESULTS));

    const listResponse = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!listResponse.ok) {
      throw new Error(`Gmail message list failed: ${listResponse.status}`);
    }
    const listData = (await listResponse.json()) as {
      messages?: { id: string }[];
    };
    if (!listData.messages || listData.messages.length === 0) return [];

    const messages: GmailCandidateMessage[] = [];
    for (const { id } of listData.messages) {
      try {
        messages.push(await this.fetchMessage(id, accessToken));
      } catch (error) {
        this.logger.error(`Failed to fetch Gmail message ${id}`, error);
      }
    }
    return messages;
  }

  private async fetchMessage(
    id: string,
    accessToken: string,
  ): Promise<GmailCandidateMessage> {
    const url = new URL(`${GMAIL_API_BASE}/messages/${id}`);
    url.searchParams.set('format', 'metadata');
    url.searchParams.append('metadataHeaders', 'From');
    url.searchParams.append('metadataHeaders', 'Subject');

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Gmail message fetch failed: ${response.status}`);
    }
    const data = (await response.json()) as {
      snippet?: string;
      internalDate?: string;
      payload?: { headers?: { name: string; value: string }[] };
    };

    const headers = data.payload?.headers ?? [];
    const fromHeader = headers.find((h) => h.name === 'From')?.value ?? '';
    const subject = headers.find((h) => h.name === 'Subject')?.value ?? '';

    return {
      id,
      fromHeader,
      subject,
      snippet: data.snippet ?? '',
      receivedAt: data.internalDate
        ? new Date(Number(data.internalDate))
        : null,
    };
  }

  private async getFreshAccessToken(
    connection: EmailConnection,
  ): Promise<string> {
    // Gmail access tokens expire hourly and this job runs once a day, so a
    // stored access token is never usable on its own — a refresh token is
    // required every run, not just a fallback path.
    if (!connection.refreshTokenEncrypted) {
      throw new Error(
        'No refresh token stored for this Gmail connection — cannot fetch a fresh access token',
      );
    }

    const encryptionKey = this.configService.getOrThrow<string>(
      'TOKEN_ENCRYPTION_KEY',
    );

    const oauth2Client = new OAuth2Client({
      clientId: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.getOrThrow<string>(
        'GOOGLE_CLIENT_SECRET',
      ),
    });
    oauth2Client.setCredentials({
      refresh_token: decrypt(connection.refreshTokenEncrypted, encryptionKey),
    });

    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error('Google did not return a refreshed access token');
    }

    connection.accessTokenEncrypted = encrypt(token, encryptionKey);
    await this.connectionRepo.save(connection);

    return token;
  }
}
