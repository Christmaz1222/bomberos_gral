import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CambiarEstadoAdminDto {
  @ApiProperty({
    description: 'Nuevo estado de la solicitud',
    example: 'EN_VERIFICACION',
    enum: [
      'BORRADOR',
      'PENDIENTE_PAGO',
      'PAGO_CONFIRMADO',
      'EN_VERIFICACION',
      'OBSERVADO',
      'APROBADO',
      'INSPECCION',
      'CERTIFICADO_EMITIDO',
      'ANULADO',
    ],
  })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiPropertyOptional({
    description: 'Observación de la transición',
    example: 'Documentación verificada correctamente',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}