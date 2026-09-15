import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CambiarEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado de la solicitud',
    example: 'PENDIENTE_PAGO',
    enum: [
      'BORRADOR',
      'PENDIENTE_PAGO',
      'PAGO_CONFIRMADO',
      'COMPROBANTE_SUBIDO',
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
    example: 'Solicitud enviada para verificación',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}