import { IsString, IsNotEmpty, MaxLength, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AgregarTramiteDto {
  @ApiProperty({
    description: 'Nombre del trámite a agregar a la sesión del ciudadano',
    example: 'Cumplimiento SIPPCI',
  })
  @IsString({ message: 'El nombre del trámite debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del trámite es obligatorio' })
  @MaxLength(40, { message: 'El nombre del trámite no debe exceder 40 caracteres' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Indica si se debe entregar el carnet de identidad para este trámite',
    example: 'si',
    enum: ['si', 'no'],
    default: 'no',
  })
  @IsOptional()
  @IsString({ message: 'entregar_ci debe ser texto' })
  @IsIn(['si', 'no'], { message: 'entregar_ci solo admite "si" o "no"' })
  entregar_ci?: string;
}
