import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
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
import { toCsv, type CsvColumn } from '@/common/utils/csv.util';
import { renderPdfTable, type PdfColumn } from '@/common/utils/pdf-table.util';
import {
  ExportService,
  type PaymentHistoryExportRow,
  type SubscriptionExportRow,
} from './export.service';
import { ExportQueryDto } from './dto/export-query.dto';

function formatBillingCycle(row: SubscriptionExportRow): string {
  if (row.billingCycle === 'custom') {
    return `custom (${row.customIntervalDays} days)`;
  }
  return row.billingCycle;
}

const SUBSCRIPTION_CSV_COLUMNS: CsvColumn<SubscriptionExportRow>[] = [
  { header: 'Name', value: (row) => row.name },
  { header: 'Category', value: (row) => row.category },
  { header: 'Cost', value: (row) => row.cost },
  { header: 'Currency', value: (row) => row.currency },
  { header: 'Billing Cycle', value: formatBillingCycle },
  { header: 'Status', value: (row) => row.status },
  { header: 'Start Date', value: (row) => row.startDate },
  { header: 'Next Renewal Date', value: (row) => row.nextRenewalDate },
];

const SUBSCRIPTION_PDF_COLUMNS: PdfColumn<SubscriptionExportRow>[] = [
  { header: 'Name', value: (row) => row.name, width: 100 },
  { header: 'Category', value: (row) => row.category, width: 70 },
  { header: 'Cost', value: (row) => String(row.cost), width: 50 },
  { header: 'Currency', value: (row) => row.currency, width: 50 },
  { header: 'Cycle', value: formatBillingCycle, width: 90 },
  { header: 'Status', value: (row) => row.status, width: 55 },
  { header: 'Next Renewal', value: (row) => row.nextRenewalDate, width: 90 },
];

const PAYMENT_HISTORY_CSV_COLUMNS: CsvColumn<PaymentHistoryExportRow>[] = [
  { header: 'Subscription Name', value: (row) => row.subscriptionName },
  { header: 'Amount', value: (row) => row.amount },
  { header: 'Currency', value: (row) => row.currency },
  { header: 'Paid At', value: (row) => row.paidAt },
];

const PAYMENT_HISTORY_PDF_COLUMNS: PdfColumn<PaymentHistoryExportRow>[] = [
  {
    header: 'Subscription Name',
    value: (row) => row.subscriptionName,
    width: 200,
  },
  { header: 'Amount', value: (row) => String(row.amount), width: 80 },
  { header: 'Currency', value: (row) => row.currency, width: 70 },
  { header: 'Paid At', value: (row) => row.paidAt, width: 100 },
];

@ApiTags('export')
@ApiBearerAuth()
@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('subscriptions')
  @ApiOperation({ summary: "Export the current user's subscriptions" })
  @ApiQuery({ name: 'format', enum: ['csv', 'pdf'] })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportSubscriptions(
    @CurrentUser() userId: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const rows = await this.exportService.getSubscriptionsRows(userId);
    const date = new Date().toISOString().slice(0, 10);

    if (query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="subscriptions-export-${date}.csv"`,
      );
      res.send(toCsv(rows, SUBSCRIPTION_CSV_COLUMNS));
      return;
    }

    renderPdfTable(res, {
      filename: `subscriptions-export-${date}.pdf`,
      title: 'Subscriptions Export',
      columns: SUBSCRIPTION_PDF_COLUMNS,
      rows,
    });
  }

  @Get('payment-history')
  @ApiOperation({ summary: "Export the current user's payment history" })
  @ApiQuery({ name: 'format', enum: ['csv', 'pdf'] })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportPaymentHistory(
    @CurrentUser() userId: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const rows = await this.exportService.getPaymentHistoryRows(userId);
    const date = new Date().toISOString().slice(0, 10);

    if (query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="payment-history-export-${date}.csv"`,
      );
      res.send(toCsv(rows, PAYMENT_HISTORY_CSV_COLUMNS));
      return;
    }

    renderPdfTable(res, {
      filename: `payment-history-export-${date}.pdf`,
      title: 'Payment History Export',
      columns: PAYMENT_HISTORY_PDF_COLUMNS,
      rows,
    });
  }
}
