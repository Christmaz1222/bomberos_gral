import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CompletarInspeccionDto {
  @ApiProperty({
    description: 'Resultado de la inspección',
    example: 'APROBADO',
    enum: ['APROBADO', 'OBSERVADO', 'RECHAZADO'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['APROBADO', 'OBSERVADO', 'RECHAZADO'])
  resultado: string;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  @ApiPropertyOptional({ description: 'Checklist de puntos verificados' })
  @IsOptional()
  @IsObject()
  checklist?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Firma del inspector (hash)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  firma_inspector?: string;
}