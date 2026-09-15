import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CertificadosService } from './certificados.service';
import { EmitirCertificadoDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('certificados')
@Controller()
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  // ============================================
  // ENDPOINTS PROTEGIDOS (JWT)
  // ============================================

  @Post('solicitudes/:codigo/certificado')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Emitir certificado',
    description:
      'Solo administradores. Emite el certificado de una solicitud en INSPECCION/APROBADO.',
  })
  @ApiBody({ type: EmitirCertificadoDto })
  @ApiResponse({ status: 201, description: 'Certificado emitido' })
  @ApiResponse({ status: 400, description: 'Estado no permite emisión' })
  @ApiResponse({ status: 403, description: 'Sin permiso' })
  async emitir(
    @Request() req,
    @Param('codigo') codigo: string,
    @Body() dto: EmitirCertificadoDto,
  ) {
    return this.certificadosService.emitirCertificado(
      codigo,
      req.user.id,
      req.user.role || 'EXTERNO',
      dto.observacion,
    );
  }

  @Get('solicitudes/:codigo/certificado')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Ver certificado de una solicitud' })
  @ApiResponse({ status: 200, description: 'Certificado' })
  async obtener(@Request() req, @Param('codigo') codigo: string) {
    return this.certificadosService.obtenerCertificado(codigo, req.user.id);
  }

  // ============================================
  // ENDPOINTS PÚBLICOS (sin JWT)
  // ============================================

  @Get('certificados/verificar/:codigoQr')
  @ApiOperation({
    summary: 'Verificación pública por código QR',
    description:
      'Endpoint público. Cualquiera puede verificar un certificado escaneando el QR.',
  })
  @ApiResponse({ status: 200, description: 'Resultado de verificación' })
  async verificar(@Param('codigoQr') codigoQr: string) {
    return this.certificadosService.verificarPorCodigoQr(codigoQr);
  }

  @Get('certificados/:numeroRegistro')
  @ApiOperation({
    summary: 'Consultar certificado por número de registro',
    description: 'Endpoint público.',
  })
  @ApiResponse({ status: 200, description: 'Datos del certificado' })
  @ApiResponse({ status: 404, description: 'Certificado no encontrado' })
  async consultar(@Param('numeroRegistro') numeroRegistro: string) {
    return this.certificadosService.consultarPorNumero(numeroRegistro);
  }
}