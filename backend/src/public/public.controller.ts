import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('solicitudes/:codigo/estado')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({
    summary: 'Consultar estado de solicitud por código',
    description:
      'Endpoint público. No requiere autenticación. Muestra información no sensible.',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código de solicitud',
    example: 'SIPPCI-PN-2026-00001',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la solicitud',
    schema: {
      example: {
        codigo: 'SIPPCI-PN-2026-00001',
        estado: 'EN_VERIFICACION',
        modulo: 'SIPPCI',
        submodulo: 'Cumplimiento SIPPCI',
        tipo_persona: 'NATURAL',
        titular: 'Juan P.',
        fecha_solicitud: '2026-09-16T10:00:00Z',
        fecha_ultima_actualizacion: '2026-09-16T12:00:00Z',
        tiene_comprobante: true,
        certificado: null,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async consultarEstado(@Param('codigo') codigo: string) {
    return this.publicService.consultarPorCodigo(codigo);
  }

  @Get('certificados/verificar/:codigoQr')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({
    summary: 'Verificar certificado por código QR',
    description: 'Endpoint público. No requiere autenticación.',
  })
  @ApiParam({ name: 'codigoQr', description: 'UUID del código QR' })
  @ApiResponse({ status: 200, description: 'Resultado de verificación' })
  async verificarCertificado(@Param('codigoQr') codigoQr: string) {
    return this.publicService.consultarPorCodigoQr(codigoQr);
  }
}