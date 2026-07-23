import {
  Controller,
  Delete,
  Get,
  Logger,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GmailIntegrationService } from './gmail-integration.service';
import { GmailCallbackQueryDto } from './dto/gmail-callback-query.dto';

@ApiTags('integrations')
@Controller('integrations/gmail')
export class GmailIntegrationController {
  private readonly logger = new Logger(GmailIntegrationController.name);

  constructor(
    private readonly gmailService: GmailIntegrationService,
    private readonly configService: ConfigService,
  ) {}

  @Get('connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get the Google OAuth consent URL to connect Gmail',
  })
  @ApiResponse({ status: 200, description: 'Consent URL generated' })
  connect(@CurrentUser() userId: string) {
    const url = this.gmailService.getConsentUrl(userId);
    return { success: true, data: { url } };
  }

  @Get('callback')
  @ApiOperation({
    summary:
      'OAuth redirect target hit by Google — exchanges the code and redirects back to the web app settings page',
  })
  @ApiResponse({ status: 302, description: 'Redirects to the web app' })
  async callback(
    @Query() query: GmailCallbackQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const webAppUrl = this.configService.getOrThrow<string>('WEB_APP_URL');

    if (query.error || !query.code || !query.state) {
      res.redirect(`${webAppUrl}/settings?gmail=error`);
      return;
    }

    try {
      await this.gmailService.handleCallback(query.code, query.state);
      res.redirect(`${webAppUrl}/settings?gmail=connected`);
    } catch (error) {
      this.logger.error(
        '[GmailIntegrationController.callback] Failed to connect Gmail',
        error,
      );
      res.redirect(`${webAppUrl}/settings?gmail=error`);
    }
  }

  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Disconnect the current user's Gmail connection" })
  @ApiResponse({ status: 200, description: 'Gmail disconnected' })
  async disconnect(@CurrentUser() userId: string) {
    await this.gmailService.disconnect(userId);
    return { success: true };
  }
}
