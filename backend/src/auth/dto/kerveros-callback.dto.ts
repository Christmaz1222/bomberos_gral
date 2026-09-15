import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class KerverosCallbackDto {
  @ApiProperty({
    description: 'Token JWT emitido por Kerveros',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: 'El token de Kerveros es obligatorio' })
  @MinLength(10, { message: 'El token de Kerveros debe ser válido' })
  token: string;
}