import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsIn,
  MaxLength,
} from 'class-validator';

export class CreateSolicitudDto {
  @ApiProperty({
    description: 'ID del submódulo (del seed de módulos)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  submodulo_id: number;

  @ApiProperty({
    description: 'Tipo de persona',
    example: 'NATURAL',
    enum: ['NATURAL', 'JURIDICA', 'EMPRESA'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['NATURAL', 'JURIDICA', 'EMPRESA'], {
    message: 'El tipo de persona debe ser NATURAL, JURIDICA o EMPRESA',
  })
  tipo_persona: string;

  @ApiPropertyOptional({
    description: 'ID de la empresa (opcional; se puede vincular después)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  empresa_id?: number;

  @ApiPropertyOptional({
    description: 'Datos específicos del formulario (JSON flexible)',
    example: {
      razon_social: 'Empresa S.R.L.',
      superficie_m2: 150,
      direccion: 'Av. Principal #123',
    },
  })
  @IsOptional()
  @IsObject()
  datos_especificos?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Ubicación geográfica (opcional)',
    example: { lat: -16.5, lng: -68.15, direccion: 'La Paz' },
  })
  @IsOptional()
  @IsObject()
  ubicacion?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Observaciones iniciales del solicitante',
    example: 'Solicito inspección urgente',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}