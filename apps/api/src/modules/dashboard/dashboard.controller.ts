import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { QuerySpendTrendDto } from './dto/query-spend-trend.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get spend totals, category breakdown, and upcoming renewals',
  })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved' })
  async getSummary(@CurrentUser() userId: string) {
    const data = await this.dashboardService.getSummary(userId);
    return { success: true, data };
  }

  @Get('spend-trend')
  @ApiOperation({ summary: 'Get monthly spend trend from payment history' })
  @ApiResponse({ status: 200, description: 'Spend trend retrieved' })
  async getSpendTrend(
    @CurrentUser() userId: string,
    @Query() query: QuerySpendTrendDto,
  ) {
    const data = await this.dashboardService.getSpendTrend(
      userId,
      query.months,
    );
    return { success: true, data };
  }
}
