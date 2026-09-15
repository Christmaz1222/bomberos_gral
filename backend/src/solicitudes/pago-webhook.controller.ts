import { Controller, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SolicitudesService } from './solicitudes.service';

/**
 * Webhook de pago — NO requiere JWT (simula el callback de Libélula).
 * En producción se validará la firma HMAC del proveedor.
 */
@ApiTags('solicitudes')
@Controller('solicitudes')
export class PagoWebhookController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post(':codigo/pago/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook simulado de pago',
    description: 'Simula el callback de Libélula. En producción validará firma.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        codigo_orden: { type: 'string', example: 'ORD-1700000000000-000000' },
      },
      required: ['codigo_orden'],
    },
  })
  @ApiResponse({ status: 200, description: 'Pago confirmado' })
  @ApiResponse({ status: 404, description: 'Solicitud o pago no encontrado' })
  async webhookPago(
    @Param('codigo') codigo: string,
    @Body('codigo_orden') codigoOrden: string,
  ) {
    return this.solicitudesService.webhookPagoSimulado(codigo, codigoOrden);
  }
}