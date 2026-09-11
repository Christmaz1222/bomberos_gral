import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@example.com',
  })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  // Alias para compatibilidad con frontend que envía "correo" (RegistroProfesionalView.vue)
  @ApiPropertyOptional({
    description: 'Alias de email (compatibilidad con frontend)',
    example: 'usuario@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  correo?: string;

  @ApiProperty({
    description: 'Contraseña',
    example: 'MiPassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
