import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';

@Entity('email_connections')
@Unique(['userId', 'provider'])
export class EmailConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: 'gmail' })
  provider: string;

  @Column('text')
  accessTokenEncrypted: string;

  @Column('text', { nullable: true })
  refreshTokenEncrypted: string | null;

  @CreateDateColumn()
  connectedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
