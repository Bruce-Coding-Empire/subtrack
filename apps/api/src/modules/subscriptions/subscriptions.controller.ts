import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { QuerySubscriptionsDto } from './dto/query-subscriptions.dto';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's subscriptions" })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved' })
  async findAll(
    @CurrentUser() userId: string,
    @Query() query: QuerySubscriptionsDto,
  ) {
    const data = await this.subscriptionsService.findAll(userId, query);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription with its payment history' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async findOne(@CurrentUser() userId: string, @Param('id') id: string) {
    const data = await this.subscriptionsService.findOne(userId, id);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  async create(
    @CurrentUser() userId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    const data = await this.subscriptionsService.create(userId, dto);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    const data = await this.subscriptionsService.update(userId, id, dto);
    return { success: true, data };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async cancel(@CurrentUser() userId: string, @Param('id') id: string) {
    const data = await this.subscriptionsService.cancel(userId, id);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a subscription (blocked if payment history exists)',
  })
  @ApiResponse({ status: 200, description: 'Subscription deleted' })
  @ApiResponse({
    status: 400,
    description: 'Subscription has payment history — cancel instead',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async remove(@CurrentUser() userId: string, @Param('id') id: string) {
    await this.subscriptionsService.remove(userId, id);
    return { success: true };
  }
}
