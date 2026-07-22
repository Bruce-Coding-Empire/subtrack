import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

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
}
