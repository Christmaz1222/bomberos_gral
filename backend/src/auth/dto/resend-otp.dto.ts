import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class ResendOtpDto {
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  correo?: string;
}
