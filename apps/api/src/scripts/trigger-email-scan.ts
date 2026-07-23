import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { EmailScanJob } from '@/modules/scheduler/email-scan.job';

async function trigger(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const emailScanJob = app.get(EmailScanJob);
  await emailScanJob.scan();
  await app.close();
}

trigger().catch((error) => {
  console.error('[trigger-email-scan] Failed to run email scan job', error);
  process.exit(1);
});
