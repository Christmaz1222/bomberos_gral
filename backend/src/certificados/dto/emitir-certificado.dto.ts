import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class EmitirCertificadoDto {
  @ApiPropertyOptional({
    description: 'Observaciones de la emisión',
    example: 'Certificado emitido tras inspección favorable',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;

  @ApiPropertyOptional({
    description: 'Días de vigencia (default: 730 = 2 años)',
    example: 730,
  })
  @IsOptional()
  @IsString()
  vigencia_dias?: string;
}