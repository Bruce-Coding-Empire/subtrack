import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CurrencyService } from '@/modules/currency/currency.service';

@Injectable()
export class ExchangeRateJob {
  private readonly logger = new Logger(ExchangeRateJob.name);

  constructor(private readonly currencyService: CurrencyService) {}

  @Cron('0 */6 * * *') // every 6 hours
  async refreshRates(): Promise<void> {
    this.logger.log('Exchange rate refresh job started');

    try {
      const { refreshed, failed } =
        await this.currencyService.refreshAndCache();
      this.logger.log(
        `Exchange rate refresh job completed — ${refreshed} currencies refreshed, ${failed} failed`,
      );
    } catch (error) {
      this.logger.error('Exchange rate refresh job failed unexpectedly', error);
    }
  }
}
