import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ExchangeRateJob } from '@/modules/scheduler/exchange-rate.job';

async function trigger(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const exchangeRateJob = app.get(ExchangeRateJob);
  await exchangeRateJob.refreshRates();
  await app.close();
}

trigger().catch((error) => {
  console.error(
    '[trigger-exchange-rate] Failed to run exchange rate job',
    error,
  );
  process.exit(1);
});
