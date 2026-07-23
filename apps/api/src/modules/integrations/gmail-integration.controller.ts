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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GmailIntegrationService } from './gmail-integration.service';

@ApiTags('integrations')
@Controller('integrations/gmail')
export class GmailIntegrationController {
  private readonly logger = new Logger(GmailIntegrationController.name);

  constructor(
    private readonly gmailService: GmailIntegrationService,
    private readonly configService: ConfigService,
  ) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current user's Gmail connection status" })
  @ApiResponse({ status: 200, description: 'Connection status retrieved' })
  async status(@CurrentUser() userId: string) {
    const connected = await this.gmailService.isConnected(userId);
    return { success: true, data: { connected } };
  }

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
  @ApiQuery({ name: 'code', required: false, example: '4/0AY0e-g7...' })
  @ApiQuery({ name: 'state', required: false, example: 'eyJhbGciOi...' })
  @ApiQuery({
    name: 'error',
    required: false,
    example: 'access_denied',
    description: 'Present when the user declines the Google consent screen',
  })
  @ApiResponse({ status: 302, description: 'Redirects to the web app' })
  async callback(
    // Deliberately untyped as a class (a plain object shape, not a DTO) —
    // reflected metatype is Object, which Nest's global ValidationPipe skips
    // validating entirely. Google's redirect carries extra params we don't
    // control or need (iss, authuser, prompt, hd, ...); a class-validator DTO
    // with forbidNonWhitelisted would 400 on those instead of the documented
    // always-redirect behavior. code/state/error are read defensively below.
    @Query() query: Record<string, unknown>,
    @Res() res: Response,
  ): Promise<void> {
    const webAppUrl = this.configService.getOrThrow<string>('WEB_APP_URL');
    const code = typeof query.code === 'string' ? query.code : undefined;
    const state = typeof query.state === 'string' ? query.state : undefined;
    const error = typeof query.error === 'string' ? query.error : undefined;

    if (error || !code || !state) {
      res.redirect(`${webAppUrl}/settings?gmail=error`);
      return;
    }

    try {
      await this.gmailService.handleCallback(code, state);
      res.redirect(`${webAppUrl}/settings?gmail=connected`);
    } catch (err) {
      this.logger.error(
        '[GmailIntegrationController.callback] Failed to connect Gmail',
        err,
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
