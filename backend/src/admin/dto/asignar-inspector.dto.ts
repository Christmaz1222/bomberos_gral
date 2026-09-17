import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class AsignarInspectorDto {
  @ApiProperty({ description: 'ID del inspector', example: 2 })
  @IsInt()
  inspector_id: number;

  @ApiPropertyOptional({ description: 'Fecha programada (ISO)', example: '2026-09-25T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  fecha_programada?: string;
}