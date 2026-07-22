import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { Subscription } from '@/modules/subscriptions/entities/subscription.entity';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepo: Repository<ExchangeRate>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async fetchLatestRates(base: string): Promise<Record<string, number>> {
    const response = await fetch(
      `${process.env.EXCHANGE_RATE_API_URL}/latest/${base}`,
    );
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }
    // `Response.json()` is typed `any` by lib.dom.d.ts — narrowing the FX
    // API's known shape is unavoidable without a runtime schema validator.
    const data = (await response.json()) as {
      result: 'success' | 'error';
      'error-type'?: string;
      rates?: Record<string, number>;
    };
    // open.er-api.com returns HTTP 200 with `{ result: "error", "error-type" }`
    // on API-level failures (e.g. an unsupported currency code) — `!response.ok`
    // alone doesn't catch that, so `result` must be checked explicitly too.
    if (data.result !== 'success' || !data.rates) {
      throw new Error(
        `Exchange rate API error: ${data['error-type'] ?? 'no rates in response'}`,
      );
    }
    return data.rates;
  }

  async getConvertedAmount(
    amount: number,
    from: string,
    to: string,
  ): Promise<number> {
    if (from === to) return amount;

    const rate = await this.exchangeRateRepo.findOne({
      where: { baseCurrency: from, targetCurrency: to },
      order: { fetchedAt: 'DESC' },
    });
    if (!rate) {
      throw new Error(`No cached rate for ${from} -> ${to}`);
    }
    return amount * rate.rate;
  }

  async refreshAndCache(): Promise<{ refreshed: number; failed: number }> {
    const currencies = await this.getDistinctCurrenciesInUse();
    let refreshed = 0;
    let failed = 0;

    for (const base of currencies) {
      try {
        const rates = await this.fetchLatestRates(base);
        for (const [target, rate] of Object.entries(rates)) {
          await this.upsertRate(base, target, rate);
        }
        refreshed++;
      } catch (error) {
        failed++;
        this.logger.error(`Failed to refresh rates for base ${base}`, error);
      }
    }

    return { refreshed, failed };
  }

  private async getDistinctCurrenciesInUse(): Promise<string[]> {
    const rows = await this.subscriptionRepo
      .createQueryBuilder('subscription')
      .select('DISTINCT subscription.currency', 'currency')
      .getRawMany<{ currency: string }>();
    return rows.map((row) => row.currency);
  }

  private async upsertRate(
    base: string,
    target: string,
    rate: number,
  ): Promise<void> {
    // exchange_rates' unique index is on (base_currency, target_currency,
    // (fetched_at::date)) — an expression index. TypeORM 1.x's type-safe
    // repository.upsert()/orUpdate() can only target a plain-column
    // constraint, and the raw-string onConflict() API was removed in 1.x, so
    // this is the only way left to hit that exact arbiter index.
    await this.exchangeRateRepo.manager.query(
      `INSERT INTO exchange_rates (base_currency, target_currency, rate, fetched_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (base_currency, target_currency, ((fetched_at)::date))
       DO UPDATE SET rate = EXCLUDED.rate, fetched_at = EXCLUDED.fetched_at`,
      [base, target, rate],
    );
  }
}
