import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { DetectedSubscriptionsService } from './detected-subscriptions.service';
import { ApproveDetectedSubscriptionDto } from './dto/approve-detected-subscription.dto';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations/detected')
@UseGuards(JwtAuthGuard)
export class DetectedSubscriptionsController {
  constructor(
    private readonly detectedSubscriptionsService: DetectedSubscriptionsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "List the current user's pending detected subscriptions",
  })
  @ApiResponse({
    status: 200,
    description: 'Pending detected subscriptions retrieved',
  })
  async findAll(@CurrentUser() userId: string) {
    const items =
      await this.detectedSubscriptionsService.findAllPending(userId);
    return { success: true, data: { items } };
  }

  @Post(':id/approve')
  @ApiOperation({
    summary:
      'Approve a detected subscription, creating a real subscription from it',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created from the detected item',
  })
  @ApiResponse({
    status: 404,
    description: 'Detected subscription not found or already reviewed',
  })
  async approve(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveDetectedSubscriptionDto,
  ) {
    const data = await this.detectedSubscriptionsService.approve(
      userId,
      id,
      dto,
    );
    return { success: true, data };
  }

  @Post(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss a detected subscription' })
  @ApiResponse({ status: 200, description: 'Detected subscription dismissed' })
  @ApiResponse({
    status: 404,
    description: 'Detected subscription not found or already reviewed',
  })
  async dismiss(@CurrentUser() userId: string, @Param('id') id: string) {
    await this.detectedSubscriptionsService.dismiss(userId, id);
    return { success: true };
  }
}
