import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsInt } from 'class-validator';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { ComprobanteService } from '../comprobantes/comprobante.service';
import {
  QuerySolicitudesAdminDto,
  CambiarEstadoAdminDto,
  AsignarInspectorDto,
  CompletarInspeccionDto,
  QueryInspeccionesDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermisosGuard } from '../common/guards/permisos.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISOS } from '../common/constants/permisos';

export class ActualizarRequisitoDto {
  @ApiProperty({ enum: ['PENDIENTE', 'CUMPLIDO', 'OBSERVADO'], example: 'CUMPLIDO' })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiPropertyOptional({ example: 'Documento verificado y conforme' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  documento_id?: number;
}

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermisosGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly comprobanteService: ComprobanteService,
  ) {}

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

  @Get('solicitudes/:codigo/comprobante')
  @RequirePermissions(PERMISOS.SOLICITUDES_READ)
  @ApiOperation({
    summary: 'Descargar comprobante de registro (admin)',
    description: 'Descarga el comprobante PDF de una solicitud. Solo para usuarios internos.',
  })
  @ApiResponse({ status: 200, description: 'PDF del comprobante' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async descargarComprobante(
    @Param('codigo') codigo: string,
    @Res() res: Response,
  ) {
    const pdfPath = await this.comprobanteService.obtenerComprobante(codigo);
    res.download(pdfPath, `comprobante-${codigo}.pdf`);
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

  @Get('solicitudes/:codigo/requisitos')
  @RequirePermissions(PERMISOS.SOLICITUDES_VIEW_REQUISITOS)
  @ApiOperation({
    summary: 'Listar requisitos y checklist de una solicitud',
    description: 'Devuelve la lista de requisitos aplicables con su estado de validación y progreso.',
  })
  @ApiResponse({ status: 200, description: 'Lista de requisitos con progreso' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async listarRequisitos(@Param('codigo') codigo: string) {
    return this.adminService.listarRequisitos(codigo);
  }

  @Patch('solicitudes/:codigo/requisitos/:id')
  @RequirePermissions(PERMISOS.SOLICITUDES_VALIDATE_REQUISITOS)
  @ApiOperation({
    summary: 'Actualizar estado de un requisito (validar/observar)',
    description: 'Permite marcar como CUMPLIDO, OBSERVADO o PENDIENTE.',
  })
  @ApiBody({ type: ActualizarRequisitoDto })
  @ApiResponse({ status: 200, description: 'Requisito actualizado' })
  @ApiResponse({ status: 400, description: 'Estado o datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permiso para validar requisitos' })
  @ApiResponse({ status: 404, description: 'Requisito o solicitud no encontrado' })
  async actualizarRequisito(
    @Request() req,
    @Param('codigo') codigo: string,
    @Param('id') id: string,
    @Body() dto: ActualizarRequisitoDto,
  ) {
    const usuarioId = req.user.sub || req.user.id;
    return this.adminService.actualizarRequisito(
      codigo,
      parseInt(id, 10),
      usuarioId,
      dto,
    );
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

  // ============================================
  // FASE 7: INSPECCIONES
  // ============================================

  @Get('inspecciones')
  @RequirePermissions(PERMISOS.INSPECCIONES_READ)
  @ApiOperation({
    summary: 'Listar inspecciones',
    description: 'Paginado con filtros por inspector/estado. Un INSPECTOR solo ve las suyas.',
  })
  @ApiResponse({ status: 200, description: 'Lista de inspecciones' })
  @ApiResponse({ status: 403, description: 'Sin permiso' })
  async listarInspecciones(@Request() req, @Query() query: QueryInspeccionesDto) {
    const userRol = req.user.rol || req.user.role;
    if (userRol === 'INSPECTOR') {
      query.inspector_id = req.user.sub || req.user.id;
    }
    return this.adminService.listarInspecciones(query);
  }

  @Get('inspecciones/:id')
  @RequirePermissions(PERMISOS.INSPECCIONES_READ)
  @ApiOperation({
    summary: 'Detalle de inspección',
    description: 'Retorna la inspección con la solicitud completa (usuario/empresa, documentos, requisitos).',
  })
  @ApiResponse({ status: 200, description: 'Detalle de la inspección' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  async detalleInspeccion(@Param('id') id: string) {
    return this.adminService.detalleInspeccion(parseInt(id, 10));
  }

  @Patch('inspecciones/:id/completar')
  @RequirePermissions(PERMISOS.INSPECCIONES_COMPLETE)
  @ApiOperation({
    summary: 'Completar inspección',
    description: 'Solo el inspector asignado (o admin/supervisor). Cambia el estado de la solicitud según el resultado.',
  })
  @ApiBody({ type: CompletarInspeccionDto })
  @ApiResponse({ status: 200, description: 'Inspección completada' })
  @ApiResponse({ status: 400, description: 'Estado o resultado inválido' })
  @ApiResponse({ status: 403, description: 'Sin permiso para completar' })
  @ApiResponse({ status: 404, description: 'Inspección no encontrada' })
  async completarInspeccion(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CompletarInspeccionDto,
  ) {
    const usuarioId = req.user.sub || req.user.id;
    return this.adminService.completarInspeccion(parseInt(id, 10), usuarioId, dto);
  }

  @Post('solicitudes/:codigo/asignar-inspector')
  @RequirePermissions(PERMISOS.INSPECCIONES_ASSIGN)
  @ApiOperation({
    summary: 'Asignar inspector a una solicitud',
    description: 'Registra la inspección en estado ASIGNADA y anota en el historial de la solicitud.',
  })
  @ApiBody({ type: AsignarInspectorDto })
  @ApiResponse({ status: 201, description: 'Inspección asignada' })
  @ApiResponse({ status: 400, description: 'El usuario no es inspector' })
  @ApiResponse({ status: 404, description: 'Solicitud o inspector no encontrados' })
  async asignarInspector(
    @Request() req,
    @Param('codigo') codigo: string,
    @Body() dto: AsignarInspectorDto,
  ) {
    const asignadoPor = req.user.sub || req.user.id;
    const fechaProgramada = dto.fecha_programada ? new Date(dto.fecha_programada) : undefined;
    return this.adminService.asignarInspector(codigo, dto.inspector_id, asignadoPor, fechaProgramada);
  }

  @Get('usuarios-internos')
  @RequirePermissions(PERMISOS.USUARIOS_READ)
  @ApiOperation({
    summary: 'Listar usuarios internos',
    description: 'Útil para poblar el selector de inspectores.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios internos activos' })
  async listarUsuariosInternos(@Query('rol') rol?: string) {
    return this.adminService.listarUsuariosInternos(rol);
  }
}