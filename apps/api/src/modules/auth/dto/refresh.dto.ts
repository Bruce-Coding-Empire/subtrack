import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    required: false,
    example: 'eyJhbGciOi...',
    description:
      'Required for mobile clients (no cookies). Web reads the refresh token from its httpOnly cookie instead.',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
