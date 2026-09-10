import { IsEmail, IsString, MinLength, MaxLength, Length, IsIn, IsOptional, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'El CI es obligatorio' })
  @IsString({ message: 'El CI debe ser texto' })
  @Length(7, 20, { message: 'El CI debe tener entre 7 y 20 caracteres' })
  ci: string;

  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @IsString({ message: 'El nombre completo debe ser texto' })
  @MinLength(3, { message: 'El nombre completo debe tener al menos 3 caracteres' })
  nombre_completo: string;

  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @IsString({ message: 'El teléfono debe ser texto' })
  telefono: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La contraseña no debe exceder 100 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El tipo de persona es obligatorio' })
  @IsString({ message: 'El tipo de persona debe ser texto' })
  @IsIn(['NATURAL', 'EMPRESA'], { message: 'El tipo de persona debe ser NATURAL o EMPRESA' })
  tipo_persona: string;

  @IsOptional()
  @IsString({ message: 'El departamento debe ser texto' })
  departamento?: string;

  @IsOptional()
  @IsString({ message: 'La provincia debe ser texto' })
  provincia?: string;

  @IsOptional()
  @IsString({ message: 'El municipio debe ser texto' })
  municipio?: string;

  @IsOptional()
  @IsString({ message: 'El área debe ser texto' })
  area?: string;
}
