import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  baseCurrency: string;

  @Column()
  targetCurrency: string;

  @Column('numeric')
  rate: number;

  @CreateDateColumn()
  fetchedAt: Date;
}
