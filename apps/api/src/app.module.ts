import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SnakeNamingStrategy } from '@/common/utils/snake-naming.strategy';
import { entities } from '@/database/entities';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { SubscriptionsModule } from '@/modules/subscriptions/subscriptions.module';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { IntegrationsModule } from '@/modules/integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        namingStrategy: new SnakeNamingStrategy(),
        entities,
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    SchedulerModule,
    DashboardModule,
    NotificationsModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
