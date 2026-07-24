import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CurrencyService } from '@/modules/currency/currency.service';

export type ExchangeRateJobSummary = {
  refreshed: number;
  failed: number;
};

@Injectable()
export class ExchangeRateJob {
  private readonly logger = new Logger(ExchangeRateJob.name);

  constructor(private readonly currencyService: CurrencyService) {}

  @Cron('0 */6 * * *') // every 6 hours
  async refreshRates(): Promise<ExchangeRateJobSummary> {
    this.logger.log('Exchange rate refresh job started');

    try {
      const { refreshed, failed } =
        await this.currencyService.refreshAndCache();
      this.logger.log(
        `Exchange rate refresh job completed — ${refreshed} currencies refreshed, ${failed} failed`,
      );
      return { refreshed, failed };
    } catch (error) {
      this.logger.error('Exchange rate refresh job failed unexpectedly', error);
      // Rethrow so the POST /jobs/exchange-rates/run trigger surfaces a 500
      // instead of reporting success; on the cron path the runner catches it.
      throw error;
    }
  }
}
