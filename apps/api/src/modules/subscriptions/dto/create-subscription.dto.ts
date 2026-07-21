import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import type {
  BillingCycle,
  SubscriptionCategory,
} from '../entities/subscription.entity';

const BILLING_CYCLES: BillingCycle[] = [
  'weekly',
  'monthly',
  'yearly',
  'custom',
];
const CATEGORIES: SubscriptionCategory[] = [
  'entertainment',
  'software',
  'fitness',
  'utilities',
  'other',
];

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Netflix' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 15.99 })
  @IsNumber()
  @IsPositive()
  cost: number;

  @ApiProperty({ example: 'USD', description: 'ISO 4217 currency code' })
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiProperty({ enum: BILLING_CYCLES })
  @IsEnum(BILLING_CYCLES)
  billingCycle: BillingCycle;

  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
    description: 'Required when billingCycle is "custom"',
  })
  @ValidateIf((dto: CreateSubscriptionDto) => dto.billingCycle === 'custom')
  @IsInt()
  @Min(1)
  customIntervalDays: number | null;

  @ApiProperty({ enum: CATEGORIES })
  @IsEnum(CATEGORIES)
  category: SubscriptionCategory;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  startDate: string;
}
