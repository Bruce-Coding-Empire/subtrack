import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from '@/common/utils/snake-naming.strategy';
import { entities } from '@/database/entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  namingStrategy: new SnakeNamingStrategy(),
  entities,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
