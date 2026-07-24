import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DemoSeedService } from '@/modules/jobs/demo-seed.service';

// The one sanctioned production seed (code-standards.md, Hosting): idempotent,
// touches only the demo user's rows — the same path POST /jobs/demo/reset runs.
async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const demoSeedService = app.get(DemoSeedService);
  await demoSeedService.reset();
  await app.close();
}

run().catch((error) => {
  console.error('[seed-demo] Failed to reset demo account', error);
  process.exit(1);
});
