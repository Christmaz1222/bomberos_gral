import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class SubirDocumentoDto {
  @ApiProperty({
    description: 'Tipo de documento (ej: PLANO, CERTIFICADO, DECLARACION)',
    example: 'PLANO',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  tipo_documento: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional del documento',
    example: 'Plano de planta baja',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;
}