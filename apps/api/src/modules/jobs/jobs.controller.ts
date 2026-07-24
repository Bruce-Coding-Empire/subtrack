import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JobTriggerGuard } from '@/common/guards/job-trigger.guard';
import { RenewalJob } from '@/modules/scheduler/renewal.job';
import { NotificationDispatchJob } from '@/modules/scheduler/notification-dispatch.job';
import { EmailScanJob } from '@/modules/scheduler/email-scan.job';
import { ExchangeRateJob } from '@/modules/scheduler/exchange-rate.job';

// External triggers for the scheduler jobs (feature 35): production hosting
// sleeps the process, so a GitHub Actions workflow fires these daily — the
// in-process @Cron decorators stay as a redundant layer, which is safe because
// the jobs are idempotent (feature 34). Callers must preserve dependency order
// (renewals → notifications → email-scan → exchange-rates); these endpoints
// deliberately don't enforce it so each job stays independently re-runnable.
@ApiTags('jobs')
@ApiHeader({
  name: 'x-job-key',
  description: 'Machine secret matching JOB_TRIGGER_SECRET',
  required: true,
})
@Controller('jobs')
@UseGuards(JobTriggerGuard)
export class JobsController {
  constructor(
    private readonly renewalJob: RenewalJob,
    private readonly notificationDispatchJob: NotificationDispatchJob,
    private readonly emailScanJob: EmailScanJob,
    private readonly exchangeRateJob: ExchangeRateJob,
  ) {}

  @Post('renewals/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run the renewal catch-up job now' })
  @ApiResponse({ status: 200, description: 'Job completed, summary returned' })
  @ApiResponse({ status: 401, description: 'Missing or invalid job key' })
  async runRenewals() {
    const data = await this.renewalJob.handleRenewals();
    return { success: true, data };
  }

  @Post('notifications/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run the notification dispatch job now' })
  @ApiResponse({ status: 200, description: 'Job completed, summary returned' })
  @ApiResponse({ status: 401, description: 'Missing or invalid job key' })
  async runNotifications() {
    const data = await this.notificationDispatchJob.dispatch();
    return { success: true, data };
  }

  @Post('email-scan/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run the Gmail scan job now' })
  @ApiResponse({ status: 200, description: 'Job completed, summary returned' })
  @ApiResponse({ status: 401, description: 'Missing or invalid job key' })
  async runEmailScan() {
    const data = await this.emailScanJob.scan();
    return { success: true, data };
  }

  @Post('exchange-rates/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run the exchange rate refresh job now' })
  @ApiResponse({ status: 200, description: 'Job completed, summary returned' })
  @ApiResponse({ status: 401, description: 'Missing or invalid job key' })
  async runExchangeRates() {
    const data = await this.exchangeRateJob.refreshRates();
    return { success: true, data };
  }
}
