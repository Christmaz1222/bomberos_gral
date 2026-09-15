import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { QuerySolicitudesAdminDto, CambiarEstadoAdminDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermisosGuard } from '../common/guards/permisos.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISOS } from '../common/constants/permisos';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermisosGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @RequirePermissions(PERMISOS.STATS_READ)
  @ApiOperation({
    summary: 'KPIs del dashboard admin',
    description: 'Retorna métricas agregadas: pendientes, en revisión, observados, etc.',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  @ApiResponse({ status: 403, description: 'Sin permiso' })
  async stats() {
    return this.adminService.obtenerStats();
  }

  @Get('solicitudes')
  @RequirePermissions(PERMISOS.SOLICITUDES_READ)
  @ApiOperation({
    summary: 'Listar todas las solicitudes (admin)',
    description: 'Listado paginado con filtros. Solo para usuarios internos.',
  })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes' })
  async listarSolicitudes(@Query() query: QuerySolicitudesAdminDto) {
    return this.adminService.listarSolicitudes(query);
  }

  @Get('solicitudes/:codigo')
  @RequirePermissions(PERMISOS.SOLICITUDES_READ)
  @ApiOperation({
    summary: 'Detalle completo de una solicitud',
    description: 'Devuelve todos los datos: historial, documentos, pagos, dominio, etc.',
  })
  @ApiResponse({ status: 200, description: 'Detalle de la solicitud' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  async detalleSolicitud(@Param('codigo') codigo: string) {
    return this.adminService.detalleSolicitud(codigo);
  }

  @Get('solicitudes/:codigo/documentos/:id/descargar')
  @RequirePermissions(PERMISOS.DOCUMENTOS_DOWNLOAD)
  @ApiOperation({
    summary: 'Descargar documento (admin)',
    description: 'Descarga un documento adjunto a una solicitud. Solo usuarios internos.',
  })
  @ApiResponse({ status: 200, description: 'Archivo descargado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async descargarDocumento(
    @Param('codigo') codigo: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { ruta, nombre_original } = await this.adminService.descargarDocumento(
      codigo,
      parseInt(id, 10),
    );

    res.download(ruta, nombre_original);
  }

  @Patch('alertas/leer-todas')
  @RequirePermissions(PERMISOS.ALERTAS_MARK_READ)
  @ApiOperation({
    summary: 'Marcar todas las alertas como leídas',
    description: 'Marca todas las alertas no leídas del sistema como leídas.',
  })
  @ApiResponse({ status: 200, description: 'Alertas marcadas' })
  async marcarTodasLeidas(@Request() req) {
    return this.adminService.marcarTodasLeidas(req.user?.id);
  }

  @Patch('alertas/:id/leida')
  @RequirePermissions(PERMISOS.ALERTAS_MARK_READ)
  @ApiOperation({
    summary: 'Marcar una alerta como leída',
    description: 'Marca una alerta individual como leída.',
  })
  @ApiResponse({ status: 200, description: 'Alerta marcada' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada' })
  async marcarAlertaLeida(@Param('id') id: string) {
    return this.adminService.marcarAlertaLeida(id);
  }

  @Get('solicitudes/:codigo/estados-permitidos')
  @RequirePermissions(PERMISOS.SOLICITUDES_READ)
  @ApiOperation({
    summary: 'Obtener estados permitidos para una solicitud',
    description: 'Devuelve los estados a los que puede transicionar según su estado actual y el rol.',
  })
  @ApiResponse({ status: 200, description: 'Estados permitidos' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async obtenerEstadosPermitidos(@Request() req, @Param('codigo') codigo: string) {
    const rol = req.user.rol || req.user.role || 'EXTERNO';
    return this.adminService.obtenerEstadosPermitidos(codigo, rol);
  }

  @Patch('solicitudes/:codigo/estado')
  @RequirePermissions(PERMISOS.SOLICITUDES_CHANGE_ESTADO)
  @ApiOperation({
    summary: 'Cambiar el estado de una solicitud',
    description: 'Aplica la state machine. Valida rol y transición permitida.',
  })
  @ApiBody({ type: CambiarEstadoAdminDto })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 400, description: 'Transición no permitida' })
  @ApiResponse({ status: 403, description: 'Sin permiso para transición' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async cambiarEstado(
    @Request() req,
    @Param('codigo') codigo: string,
    @Body() dto: CambiarEstadoAdminDto,
  ) {
    const rol = req.user.rol || req.user.role || 'EXTERNO';
    const usuarioId = req.user.id;
    return this.adminService.cambiarEstado(codigo, usuarioId, rol, dto);
  }

  @Get('alertas')
  @RequirePermissions(PERMISOS.ALERTAS_READ)
  @ApiOperation({
    summary: 'Alertas del sistema',
    description: 'Alertas de la BD + alertas generadas (vencimientos próximos).',
  })
  @ApiResponse({ status: 200, description: 'Lista de alertas' })
  async alertas(@Query('noLeidas') noLeidas?: string) {
    return this.adminService.listarAlertas(noLeidas === 'true');
  }

  @Get('guardia')
  @RequirePermissions(PERMISOS.STATS_READ)
  @ApiOperation({
    summary: 'Estado del turno de guardia',
    description: 'Mock hasta implementar Bloque K.',
  })
  @ApiResponse({ status: 200, description: 'Estado de guardia' })
  async guardia() {
    return this.adminService.obtenerGuardia();
  }
}