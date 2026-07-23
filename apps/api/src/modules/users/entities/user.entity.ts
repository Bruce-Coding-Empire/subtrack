import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { numericTransformer } from '@/common/utils/numeric.transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'RWF' })
  baseCurrency: string;

  @Column('numeric', { nullable: true, transformer: numericTransformer })
  monthlySpendLimit: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
