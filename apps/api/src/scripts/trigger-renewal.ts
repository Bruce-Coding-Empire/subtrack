import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { RenewalJob } from '@/modules/scheduler/renewal.job';

async function trigger(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const renewalJob = app.get(RenewalJob);
  await renewalJob.handleRenewals();
  await app.close();
}

trigger().catch((error) => {
  console.error('[trigger-renewal] Failed to run renewal job', error);
  process.exit(1);
});
