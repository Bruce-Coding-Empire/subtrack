import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Deliberately does not touch the DB — answers "is the process up" for
  // Render's health check, the uptime pinger, and the GitHub Actions workflow's
  // wake-up call, without hammering Postgres every few minutes.
  @Get('health')
  @ApiTags('health')
  @ApiOperation({ summary: 'Liveness check — no auth, no DB' })
  @ApiResponse({ status: 200, description: 'Process is up' })
  getHealth(): { success: boolean; data: { status: string } } {
    return { success: true, data: { status: 'ok' } };
  }
}
