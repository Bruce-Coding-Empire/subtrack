import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'RWF',
    required: false,
    description: 'ISO 4217 currency code',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  baseCurrency?: string;

  @ApiProperty({
    example: 200.0,
    required: false,
    nullable: true,
    description:
      'Non-negative number to set, null to clear, omit to leave unchanged',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlySpendLimit?: number | null;
}
