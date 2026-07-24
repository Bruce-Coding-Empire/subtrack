import { Module } from '@nestjs/common';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';
import { JobsController } from './jobs.controller';

@Module({
  imports: [SchedulerModule],
  controllers: [JobsController],
})
export class JobsModule {}
