import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class KerverosExchangeDto {
  @IsString()
  @IsNotEmpty({ message: 'El token de Kerveros es obligatorio' })
  @MinLength(10, { message: 'El token de Kerveros debe ser válido' })
  token: string;
}