import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { SolicitudesService } from './solicitudes.service';
import {
  CreateSolicitudDto,
  QuerySolicitudesDto,
  SubirDocumentoDto,
  IniciarPagoDto,
  CambiarEstadoDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('solicitudes')
@ApiBearerAuth('access-token')
@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nueva solicitud',
    description: 'Crea una solicitud de trámite. Genera código único automáticamente.',
  })
  @ApiBody({ type: CreateSolicitudDto })
  @ApiResponse({
    status: 201,
    description: 'Solicitud creada',
    schema: {
      example: {
        message: 'Solicitud creada exitosamente',
        solicitud: {
          id: 1,
          codigo: 'SIPPCI-PN-2026-00001',
          estado: 'BORRADOR',
          fecha_solicitud: '2026-09-15T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async crear(@Request() req, @Body() dto: CreateSolicitudDto) {
    return this.solicitudesService.crear(req.user.id, dto);
  }

  @Get('mias')
  @ApiOperation({
    summary: 'Listar mis solicitudes',
    description: 'Devuelve todas las solicitudes del usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes' })
  async misSolicitudes(@Request() req, @Query() query: QuerySolicitudesDto) {
    return this.solicitudesService.misSolicitudes(req.user.id, query);
  }

  @Get(':codigo')
  @ApiOperation({
    summary: 'Obtener solicitud por código',
    description: 'Devuelve los detalles completos de una solicitud',
  })
  @ApiResponse({ status: 200, description: 'Solicitud encontrada' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async porCodigo(@Request() req, @Param('codigo') codigo: string) {
    return this.solicitudesService.porCodigo(codigo, req.user.id);
  }

  @Post(':codigo/documentos')
  @UseInterceptors(FileInterceptor('archivo'))
  @ApiOperation({
    summary: 'Subir documento',
    description: 'Sube un documento a una solicitud. Multipart/form-data.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: { type: 'string', format: 'binary' },
        tipo_documento: { type: 'string', example: 'PLANO' },
        descripcion: { type: 'string', example: 'Plano de planta baja' },
      },
      required: ['archivo', 'tipo_documento'],
    },
  })
  @ApiResponse({ status: 201, description: 'Documento subido' })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async subirDocumento(
    @Request() req,
    @Param('codigo') codigo: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SubirDocumentoDto,
  ) {
    return this.solicitudesService.subirDocumento(codigo, req.user.id, file, dto);
  }

  @Get(':codigo/documentos')
  @ApiOperation({ summary: 'Listar documentos de una solicitud' })
  @ApiResponse({ status: 200, description: 'Lista de documentos' })
  async listarDocumentos(@Request() req, @Param('codigo') codigo: string) {
    return this.solicitudesService.listarDocumentos(codigo, req.user.id);
  }

  @Get(':codigo/documentos/:id/descargar')
  @ApiOperation({ summary: 'Descargar un documento' })
  @ApiResponse({ status: 200, description: 'Archivo' })
  async descargarDocumento(
    @Request() req,
    @Param('codigo') codigo: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { ruta, nombre_original } = await this.solicitudesService.descargarDocumento(
      codigo,
      parseInt(id),
      req.user.id,
    );
    res.download(ruta, nombre_original);
  }

  @Delete(':codigo/documentos/:id')
  @ApiOperation({ summary: 'Eliminar un documento' })
  @ApiResponse({ status: 200, description: 'Documento eliminado' })
  async eliminarDocumento(
    @Request() req,
    @Param('codigo') codigo: string,
    @Param('id') id: string,
  ) {
    return this.solicitudesService.eliminarDocumento(codigo, parseInt(id), req.user.id);
  }

  @Post(':codigo/pago')
  @ApiOperation({
    summary: 'Iniciar pago (simulado)',
    description: 'Crea un pago pendiente. En producción se integrará con Libélula.',
  })
  @ApiBody({ type: IniciarPagoDto })
  @ApiResponse({ status: 201, description: 'Pago iniciado' })
  @ApiResponse({ status: 400, description: 'No requiere pago o ya pagado' })
  async iniciarPago(
    @Request() req,
    @Param('codigo') codigo: string,
    @Body() dto: IniciarPagoDto,
  ) {
    return this.solicitudesService.iniciarPago(codigo, req.user.id, dto);
  }

  @Get(':codigo/pago')
  @ApiOperation({ summary: 'Consultar estado del pago' })
  @ApiResponse({ status: 200, description: 'Estado del pago' })
  async consultarPago(@Request() req, @Param('codigo') codigo: string) {
    return this.solicitudesService.consultarPago(codigo, req.user.id);
  }

  @Patch(':codigo/estado')
  @ApiOperation({
    summary: 'Cambiar estado de la solicitud',
    description: 'Aplica la state machine. Valida rol y transición permitida.',
  })
  @ApiBody({ type: CambiarEstadoDto })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 400, description: 'Transición no permitida' })
  @ApiResponse({ status: 403, description: 'Sin permiso para transición' })
  async cambiarEstado(
    @Request() req,
    @Param('codigo') codigo: string,
    @Body() dto: CambiarEstadoDto,
  ) {
    return this.solicitudesService.cambiarEstado(
      codigo,
      req.user.id,
      req.user.role || 'EXTERNO',
      dto,
    );
  }
}