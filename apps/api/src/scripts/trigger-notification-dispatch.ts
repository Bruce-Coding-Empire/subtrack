import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { NotificationDispatchJob } from '@/modules/scheduler/notification-dispatch.job';

async function trigger(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const notificationDispatchJob = app.get(NotificationDispatchJob);
  await notificationDispatchJob.dispatch();
  await app.close();
}

trigger().catch((error) => {
  console.error(
    '[trigger-notification-dispatch] Failed to run notification dispatch job',
    error,
  );
  process.exit(1);
});
