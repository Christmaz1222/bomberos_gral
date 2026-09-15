import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KerverosExchangeDto {
  @ApiProperty({
    description: 'Token JWT emitido por Kerveros (SSO)',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: 'El token de Kerveros es obligatorio' })
  @MinLength(10, { message: 'El token de Kerveros debe ser válido' })
  token: string;

  @ApiPropertyOptional({
    description: 'CI del funcionario (mock)',
    example: '9905200',
  })
  @IsOptional()
  @IsString()
  ci?: string;
}