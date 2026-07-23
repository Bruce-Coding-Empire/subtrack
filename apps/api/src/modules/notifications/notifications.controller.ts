import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('preferences')
  @ApiOperation({ summary: "Get the current user's notification preferences" })
  @ApiResponse({ status: 200, description: 'Preferences retrieved' })
  async getPreferences(@CurrentUser() userId: string) {
    const data = await this.notificationsService.getPreferences(userId);
    return { success: true, data };
  }

  @Patch('preferences')
  @ApiOperation({
    summary: "Update the current user's notification preferences",
  })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  async updatePreferences(
    @CurrentUser() userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    const data = await this.notificationsService.updatePreferences(userId, dto);
    return { success: true, data };
  }

  @Post('push-token')
  @ApiOperation({ summary: "Store the current user's Expo push token" })
  @ApiResponse({ status: 201, description: 'Push token stored' })
  async registerPushToken(
    @CurrentUser() userId: string,
    @Body() dto: RegisterPushTokenDto,
  ) {
    await this.notificationsService.registerPushToken(userId, dto.pushToken);
    return { success: true };
  }
}
