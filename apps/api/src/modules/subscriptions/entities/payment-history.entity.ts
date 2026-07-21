import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('payment_history')
export class PaymentHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  subscriptionId: string;

  @Index()
  @Column()
  userId: string;

  @Column('numeric')
  amount: number;

  @Column()
  currency: string;

  @Column('date')
  paidAt: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
