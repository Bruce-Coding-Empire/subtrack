import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GmailCallbackQueryDto {
  @ApiProperty({ required: false, example: '4/0AY0e-g7...' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false, example: 'eyJhbGciOi...' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    required: false,
    example: 'access_denied',
    description: 'Present when the user declines the Google consent screen',
  })
  @IsOptional()
  @IsString()
  error?: string;
}
