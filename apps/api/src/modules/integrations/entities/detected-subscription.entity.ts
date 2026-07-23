import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { numericTransformer } from '@/common/utils/numeric.transformer';

export type DetectedSubscriptionStatus = 'pending' | 'approved' | 'dismissed';
export type DetectedBillingCycle = 'weekly' | 'monthly' | 'yearly' | 'custom';

@Entity('detected_subscriptions')
@Unique(['userId', 'gmailMessageId'])
export class DetectedSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column()
  gmailMessageId: string;

  @Column('text', { nullable: true })
  vendorName: string | null;

  @Column('numeric', { nullable: true, transformer: numericTransformer })
  amount: number | null;

  @Column('text', { nullable: true })
  currency: string | null;

  @Column({
    type: 'enum',
    enum: ['weekly', 'monthly', 'yearly', 'custom'],
    enumName: 'detected_subscriptions_billing_cycle_enum',
    nullable: true,
  })
  billingCycle: DetectedBillingCycle | null;

  @Column('text')
  rawSubject: string;

  @Column({ type: 'timestamptz', nullable: true })
  receivedAt: Date | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'dismissed'],
    enumName: 'detected_subscriptions_status_enum',
    default: 'pending',
  })
  status: DetectedSubscriptionStatus;

  @CreateDateColumn()
  detectedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
