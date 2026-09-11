import { IsEmail, IsString, MinLength, MaxLength, Length, IsIn, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Cédula de identidad (7-20 caracteres)',
    example: '1234567',
  })
  @IsNotEmpty({ message: 'El CI es obligatorio' })
  @IsString({ message: 'El CI debe ser texto' })
  @Length(7, 20, { message: 'El CI debe tener entre 7 y 20 caracteres' })
  ci: string;

  @ApiProperty({
    description: 'Nombre completo del ciudadano',
    example: 'Juan Pérez Mamani',
  })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @IsString({ message: 'El nombre completo debe ser texto' })
  @MinLength(3, { message: 'El nombre completo debe tener al menos 3 caracteres' })
  nombre_completo: string;

  @ApiProperty({
    description: 'Correo electrónico (único)',
    example: 'usuario@example.com',
  })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '70000000',
  })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @IsString({ message: 'El teléfono debe ser texto' })
  telefono: string;

  @ApiProperty({
    description: 'Contraseña (mínimo 8 caracteres)',
    example: 'MiPassword123',
    minLength: 8,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La contraseña no debe exceder 100 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Tipo de persona',
    example: 'NATURAL',
    enum: ['NATURAL', 'EMPRESA'],
  })
  @IsNotEmpty({ message: 'El tipo de persona es obligatorio' })
  @IsString({ message: 'El tipo de persona debe ser texto' })
  @IsIn(['NATURAL', 'EMPRESA'], { message: 'El tipo de persona debe ser NATURAL o EMPRESA' })
  tipo_persona: string;

  @ApiPropertyOptional({
    description: 'Departamento',
    example: 'La Paz',
  })
  @IsOptional()
  @IsString({ message: 'El departamento debe ser texto' })
  departamento?: string;

  @ApiPropertyOptional({
    description: 'Provincia',
    example: 'Murillo',
  })
  @IsOptional()
  @IsString({ message: 'La provincia debe ser texto' })
  provincia?: string;

  @ApiPropertyOptional({
    description: 'Municipio',
    example: 'La Paz',
  })
  @IsOptional()
  @IsString({ message: 'El municipio debe ser texto' })
  municipio?: string;

  @ApiPropertyOptional({
    description: 'Área de interés',
    example: 'Industrial',
  })
  @IsOptional()
  @IsString({ message: 'El área debe ser texto' })
  area?: string;
}
