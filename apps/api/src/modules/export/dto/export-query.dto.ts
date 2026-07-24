import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export type ExportFormat = 'csv' | 'pdf';

const FORMATS: ExportFormat[] = ['csv', 'pdf'];

export class ExportQueryDto {
  @ApiProperty({ enum: FORMATS })
  @IsIn(FORMATS)
  format: ExportFormat;
}
