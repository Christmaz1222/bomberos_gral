import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class IniciarPagoDto {
  @ApiPropertyOptional({
    description: 'Método de pago preferido (opcional)',
    example: 'QR',
    enum: ['QR', 'TARJETA', 'TRANSFERENCIA'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  metodo?: string;

  @ApiPropertyOptional({
    description: 'Observaciones del pago',
    example: 'Pago correspondiente a certificación',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observacion?: string;
}