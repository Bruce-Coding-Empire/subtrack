import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';

export type BillingCycle = 'weekly' | 'monthly' | 'yearly' | 'custom';
export type SubscriptionCategory =
  'entertainment' | 'software' | 'fitness' | 'utilities' | 'other';
export type SubscriptionStatus = 'active' | 'cancelled';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column()
  name: string;

  @Column('numeric')
  cost: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: ['weekly', 'monthly', 'yearly', 'custom'],
    enumName: 'subscriptions_billing_cycle_enum',
  })
  billingCycle: BillingCycle;

  @Column({ type: 'int', nullable: true })
  customIntervalDays: number | null;

  @Column({
    type: 'enum',
    enum: ['entertainment', 'software', 'fitness', 'utilities', 'other'],
    enumName: 'subscriptions_category_enum',
  })
  category: SubscriptionCategory;

  @Column({
    type: 'enum',
    enum: ['active', 'cancelled'],
    enumName: 'subscriptions_status_enum',
    default: 'active',
  })
  status: SubscriptionStatus;

  @Column('date')
  startDate: string;

  @Column('date')
  nextRenewalDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
