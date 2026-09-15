import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySolicitudesAdminDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: [
      'BORRADOR', 'PENDIENTE_PAGO', 'PAGO_CONFIRMADO',
      'EN_VERIFICACION', 'OBSERVADO', 'APROBADO',
      'INSPECCION', 'CERTIFICADO_EMITIDO', 'ANULADO',
    ],
  })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ description: 'Filtrar por módulo (nombre)' })
  @IsOptional()
  @IsString()
  modulo?: string;

  @ApiPropertyOptional({ description: 'Buscar por código, CI o razón social' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Página (default: 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Límite por página (default: 20)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}