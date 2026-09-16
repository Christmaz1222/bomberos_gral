import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { EstadoSolicitud } from '@prisma/client';
import {
  CreateSolicitudDto,
  QuerySolicitudesDto,
  SubirDocumentoDto,
  IniciarPagoDto,
  CambiarEstadoDto,
} from './dto';
import { TRANSICIONES_PERMITIDAS, ROLES_TRANSICION } from './enums/transiciones';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class SolicitudesService {
  private readonly logger = new Logger(SolicitudesService.name);

  /**
   * Directorio base para uploads (local; migrable a S3/MinIO luego)
   */
  private readonly UPLOADS_DIR = path.join(process.cwd(), 'uploads');

  /**
   * Extensiones permitidas
   */
  private readonly ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.doc'];

  /**
   * Tamaño máximo de archivo: 10 MB
   */
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  /**
   * Mapa de abreviaturas de módulos para códigos de solicitud
   * Formato: MODULO_ABREV[moduloNombre] = abreviatura
   */
  private readonly MODULO_ABREV: Record<string, string> = {
    'SIPPCI': 'SIPPCI',
    'REGLAMENTACION': 'REGLAM',
    'TURISMO': 'TURIS',
    'CAPACITACION': 'CAPAC',
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Genera un código único para la solicitud
   * Formato: {MODULO}-{PN/PJ}-{AÑO}-{SECUENCIAL}
   * Ejemplo: SIPPCI-PN-2026-00001
   */
  private async generarCodigo(moduloNombre: string, tipoPersona: string): Promise<string> {
    const anio = new Date().getFullYear();
    // FASE 3a-fix: JURIDICA o EMPRESA → PJ; resto → PN
    const tipoNorm = tipoPersona.toUpperCase();
    const tipoCorto =
      tipoNorm === 'JURIDICA' || tipoNorm === 'EMPRESA' ? 'PJ' : 'PN';

    // Usar mapa de abreviaturas; fallback a substring si no está en el mapa
    const moduloUpper = moduloNombre.toUpperCase();
    const moduloAbrev = this.MODULO_ABREV[moduloUpper] || moduloUpper.substring(0, 6);

    // Contar solicitudes existentes del mismo módulo/año
    const prefijo = `${moduloAbrev}-${tipoCorto}-${anio}-`;
    const count = await this.prisma.solicitud.count({
      where: {
        codigo: { startsWith: prefijo },
      },
    });

    const secuencial = (count + 1).toString().padStart(5, '0');
    return `${prefijo}${secuencial}`;
  }

  /**
   * Crea una nueva solicitud
   */
  async crear(usuarioId: number, dto: CreateSolicitudDto) {
    // 1. Verificar que el submódulo existe y está activo
    const submodulo = await this.prisma.submodulo.findUnique({
      where: { id: dto.submodulo_id },
      include: {
        modulo: true,
        configuracion: true,
      },
    });

    if (!submodulo) {
      throw new BadRequestException(`Submódulo ${dto.submodulo_id} no encontrado`);
    }

    if (submodulo.configuracion && !submodulo.configuracion.activo) {
      throw new BadRequestException('El submódulo está inactivo');
    }

    // 2. FASE 3a-fix: normalizar tipo de persona (EMPRESA → JURIDICA para coherencia legacy)
    const tipoPersona =
      (dto.tipo_persona || 'NATURAL').toUpperCase() === 'EMPRESA'
        ? 'JURIDICA'
        : (dto.tipo_persona || 'NATURAL').toUpperCase();

    // Empresa OPCIONAL: solo validar su existencia si se envía empresa_id
    if (dto.empresa_id) {
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: dto.empresa_id },
      });
      if (!empresa) {
        throw new BadRequestException('Empresa no encontrada');
      }
    }

    // 3. Generar código único (PN/PJ según tipo normalizado)
    const codigo = await this.generarCodigo(submodulo.modulo.nombre, tipoPersona);

    // 4. Crear la solicitud
    const solicitud = await this.prisma.solicitud.create({
      data: {
        codigo,
        usuario_id: usuarioId,
        submodulo_id: dto.submodulo_id,
        tipo_persona: tipoPersona,
        empresa_id: dto.empresa_id || null,
        estado: 'BORRADOR' as const,
        ubicacion: dto.ubicacion ?? undefined,
        observacion: dto.observacion || null,
        fecha_solicitud: new Date(),
      },
    });

    // 5. Escribir en HistorialSolicitud
    await this.prisma.historialSolicitud.create({
      data: {
        solicitud_id: solicitud.id,
        usuario_id: usuarioId,
        estado_anterior: null,
        estado_nuevo: 'BORRADOR',
        observacion: 'Solicitud creada por el usuario',
      },
    });

    // 6. Guardar datos específicos en la tabla de dominio
    if (dto.datos_especificos) {
      await this.guardarDatosDominio(
        solicitud.id,
        submodulo.modulo.nombre,
        tipoPersona,
        dto.datos_especificos,
      );
    }

    this.logger.log(`✅ Solicitud creada: ${codigo} (usuario ${usuarioId})`);

    return {
      message: 'Solicitud creada exitosamente',
      solicitud: {
        id: solicitud.id,
        codigo: solicitud.codigo,
        estado: solicitud.estado,
        fecha_solicitud: solicitud.fecha_solicitud,
      },
    };
  }

  /**
   * Guarda los datos específicos en la tabla de dominio correspondiente
   */
  private async guardarDatosDominio(
    solicitudId: number,
    moduloNombre: string,
    tipoPersona: string,
    datos: Record<string, any>,
  ) {
    const moduloNormalizado = moduloNombre.toUpperCase();

    if (moduloNormalizado.includes('SIPPCI')) {
      await this.prisma.sippciDatos.create({
        data: {
          solicitud_id: solicitudId,
          tipo_persona: tipoPersona,
          datos_especificos: datos,
        },
      });
    } else if (moduloNormalizado.includes('REGLAMENT')) {
      await this.prisma.reglamentacionDatos.create({
        data: {
          solicitud_id: solicitudId,
          tipo_reglamento: datos.tipo_reglamento || 'GENERAL',
          datos_especificos: datos,
        },
      });
    } else if (moduloNormalizado.includes('TURISMO')) {
      await this.prisma.turismoDatos.create({
        data: {
          solicitud_id: solicitudId,
          tipo_actividad: datos.tipo_actividad || 'TERRESTRE',
          datos_especificos: datos,
        },
      });
    } else if (moduloNormalizado.includes('CAPACIT')) {
      await this.prisma.capacitacionDatos.create({
        data: {
          solicitud_id: solicitudId,
          tipo_capacitacion: datos.tipo_capacitacion || 'GENERAL',
          datos_especificos: datos,
        },
      });
    }
  }

  /**
   * Lista las solicitudes del usuario autenticado
   */
  async misSolicitudes(usuarioId: number, query: QuerySolicitudesDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { usuario_id: usuarioId };
    if (query.estado) where.estado = query.estado;
    if (query.submodulo_id) where.submodulo_id = query.submodulo_id;

    const [solicitudes, total] = await Promise.all([
      this.prisma.solicitud.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          submodulo: {
            include: { modulo: true },
          },
        },
      }),
      this.prisma.solicitud.count({ where }),
    ]);

    return {
      data: solicitudes.map((s) => ({
        id: s.id,
        codigo: s.codigo,
        estado: s.estado,
        fecha_solicitud: s.fecha_solicitud,
        modulo: s.submodulo.modulo.nombre,
        submodulo: s.submodulo.nombre,
        tipo_persona: s.tipo_persona,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene una solicitud por código
   */
  async porCodigo(codigo: string, usuarioId: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      include: {
        submodulo: { include: { modulo: true } },
        historial: {
          orderBy: { created_at: 'asc' },
        },
        sippci_datos: true,
        reglamentacion_datos: true,
        turismo_datos: true,
        capacitacion_datos: true,
        documentos: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    // Solo el dueño puede ver su solicitud (por ahora)
    if (solicitud.usuario_id !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para ver esta solicitud');
    }

    return solicitud;
  }

  /**
   * Sube un documento a una solicitud
   */
  async subirDocumento(
    codigo: string,
    usuarioId: number,
    file: Express.Multer.File,
    dto: SubirDocumentoDto,
  ) {
    // 1. Verificar que la solicitud existe y es del usuario
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    if (solicitud.usuario_id !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para modificar esta solicitud');
    }

    // 2. Validar archivo
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(`Archivo excede ${this.MAX_FILE_SIZE / 1024 / 1024} MB`);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.ALLOWED_EXT.includes(ext)) {
      throw new BadRequestException(`Extensión no permitida: ${ext}`);
    }

    // 3. Crear carpeta específica para la solicitud
    const solicitudDir = path.join(this.UPLOADS_DIR, codigo);
    if (!fs.existsSync(solicitudDir)) {
      fs.mkdirSync(solicitudDir, { recursive: true });
    }

    // 4. Generar nombre único para el archivo
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const nombreArchivo = `${timestamp}-${random}${ext}`;
    const rutaCompleta = path.join(solicitudDir, nombreArchivo);

    // 5. Guardar el archivo
    fs.writeFileSync(rutaCompleta, file.buffer);

    // 6. Calcular checksum
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // 7. Guardar en BD
    const documento = await this.prisma.documentoSolicitud.create({
      data: {
        solicitud_id: solicitud.id,
        nombre_original: file.originalname,
        nombre_archivo: nombreArchivo,
        ruta_archivo: `uploads/${codigo}/${nombreArchivo}`,
        tipo_documento: dto.tipo_documento,
        descripcion: dto.descripcion ?? null,
        checksum,
      },
    });

    this.logger.log(`📎 Documento subido: ${codigo}/${nombreArchivo} (${file.size} bytes)`);

    return {
      message: 'Documento subido exitosamente',
      documento: {
        id: documento.id,
        nombre_original: documento.nombre_original,
        tipo_documento: documento.tipo_documento,
        fecha_subida: documento.fecha_subida,
        tamano: file.size,
      },
    };
  }

  /**
   * Lista los documentos de una solicitud
   */
  async listarDocumentos(codigo: string, usuarioId: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      include: { documentos: true },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    if (solicitud.usuario_id !== usuarioId) {
      throw new ForbiddenException('No tienes permiso');
    }

    return {
      codigo,
      documentos: solicitud.documentos.map((d) => ({
        id: d.id,
        nombre_original: d.nombre_original,
        tipo_documento: d.tipo_documento,
        fecha_subida: d.fecha_subida,
      })),
    };
  }

  /**
   * Descarga un documento
   */
  async descargarDocumento(codigo: string, documentoId: number, usuarioId: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    if (solicitud.usuario_id !== usuarioId) {
      throw new ForbiddenException('No tienes permiso');
    }

    const documento = await this.prisma.documentoSolicitud.findFirst({
      where: { id: documentoId, solicitud_id: solicitud.id },
    });

    if (!documento) {
      throw new NotFoundException('Documento no encontrado');
    }

    const rutaCompleta = path.join(process.cwd(), documento.ruta_archivo);
    if (!fs.existsSync(rutaCompleta)) {
      throw new NotFoundException('Archivo físico no encontrado');
    }

    return {
      ruta: rutaCompleta,
      nombre_original: documento.nombre_original,
    };
  }

  /**
   * Elimina un documento
   */
  async eliminarDocumento(codigo: string, documentoId: number, usuarioId: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
    });

    if (!solicitud) throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    if (solicitud.usuario_id !== usuarioId) throw new ForbiddenException('No tienes permiso');

    const documento = await this.prisma.documentoSolicitud.findFirst({
      where: { id: documentoId, solicitud_id: solicitud.id },
    });

    if (!documento) throw new NotFoundException('Documento no encontrado');

    // Eliminar archivo físico
    const rutaCompleta = path.join(process.cwd(), documento.ruta_archivo);
    if (fs.existsSync(rutaCompleta)) {
      fs.unlinkSync(rutaCompleta);
    }

    // Eliminar de BD
    await this.prisma.documentoSolicitud.delete({ where: { id: documentoId } });

    // Purga carpeta si queda vacía
    this.purgarCarpetaUploads(codigo);

    return { message: 'Documento eliminado' };
  }

  /**
   * Purga la carpeta de uploads de una solicitud si queda vacía
   */
  private purgarCarpetaUploads(codigo: string) {
    const solicitudDir = path.join(this.UPLOADS_DIR, codigo);
    if (fs.existsSync(solicitudDir)) {
      const files = fs.readdirSync(solicitudDir);
      if (files.length === 0) {
        fs.rmdirSync(solicitudDir);
        this.logger.log(`🧹 Carpeta purgada: ${codigo}`);
      }
    }
  }

  /**
   * Inicia un pago simulado para una solicitud
   */
  async iniciarPago(codigo: string, usuarioId: number, dto: IniciarPagoDto) {
    // 1. Buscar la solicitud
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      include: {
        submodulo: {
          include: {
            modulo: true,
            configuracion: true,
          },
        },
        pagos: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    if (solicitud.usuario_id !== usuarioId) {
      throw new ForbiddenException('No tienes permiso');
    }

    // 2. Verificar que la solicitud está en estado correcto
    if (solicitud.estado !== 'BORRADOR') {
      throw new BadRequestException(
        `Solo se puede pagar desde BORRADOR. Estado actual: ${solicitud.estado}`,
      );
    }

    // 3. Verificar que no haya pago ya
    if (solicitud.pagos && solicitud.pagos.length > 0) {
      const pagoExistente = solicitud.pagos[0];
      if (pagoExistente.estado === 'PENDIENTE') {
        return {
          message: 'Ya existe un pago pendiente',
          pago: {
            id: pagoExistente.id,
            codigo_orden: pagoExistente.codigo_orden,
            monto_ufv: pagoExistente.monto_ufv,
            monto_bs: pagoExistente.monto_bs,
            estado: pagoExistente.estado,
            url_pasarela: `/api/solicitudes/${codigo}/pago/simulado/${pagoExistente.codigo_orden}`,
          },
        };
      }
      if (pagoExistente.estado === 'PAGADO' || pagoExistente.estado === 'CONFIRMADO') {
        throw new BadRequestException('Esta solicitud ya tiene un pago confirmado');
      }
    }

    // 4. Verificar si requiere pago
    const config = solicitud.submodulo.configuracion;
    if (!config || !config.requiere_pago) {
      throw new BadRequestException('Esta solicitud no requiere pago');
    }

    // 5. Crear el pago simulado
    const codigoOrden = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const pago = await this.prisma.pago.create({
      data: {
        solicitud_id: solicitud.id,
        monto_ufv: config.monto_ufv || 0,
        monto_bs: config.monto_bs || 0,
        codigo_orden: codigoOrden,
        estado: 'PENDIENTE',
      },
    });

    // 6. Transicionar solicitud a PENDIENTE_PAGO
    await this.prisma.solicitud.update({
      where: { id: solicitud.id },
      data: { estado: 'PENDIENTE_PAGO' },
    });

    await this.prisma.historialSolicitud.create({
      data: {
        solicitud_id: solicitud.id,
        usuario_id: usuarioId,
        estado_anterior: 'BORRADOR',
        estado_nuevo: 'PENDIENTE_PAGO',
        observacion: `Pago iniciado: ${codigoOrden}`,
      },
    });

    this.logger.log(`💰 Pago iniciado: ${codigo} → ${codigoOrden}`);

    return {
      message: 'Pago iniciado exitosamente (simulado)',
      pago: {
        id: pago.id,
        codigo_orden: pago.codigo_orden,
        monto_ufv: pago.monto_ufv,
        monto_bs: pago.monto_bs,
        estado: pago.estado,
        url_pasarela: `/api/solicitudes/${codigo}/pago/simulado/${codigoOrden}`,
        nota: 'URL simulada. En producción será la URL de Libélula.',
      },
    };
  }

  /**
   * Consulta el estado del pago de una solicitud
   */
  async consultarPago(codigo: string, usuarioId: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      include: { pagos: true },
    });

    if (!solicitud) throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    if (solicitud.usuario_id !== usuarioId) throw new ForbiddenException('No tienes permiso');

    if (!solicitud.pagos || solicitud.pagos.length === 0) {
      return { codigo, pago: null, message: 'No hay pagos registrados' };
    }

    const pago = solicitud.pagos[0];
    return {
      codigo,
      estado_solicitud: solicitud.estado,
      pago: {
        id: pago.id,
        codigo_orden: pago.codigo_orden,
        monto_ufv: pago.monto_ufv,
        monto_bs: pago.monto_bs,
        estado: pago.estado,
        fecha_verificacion: pago.fecha_verificacion,
      },
    };
  }

  /**
   * Webhook simulado — marca el pago como pagado
   */
  async webhookPagoSimulado(codigo: string, codigoOrden: string) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      include: { pagos: true },
    });

    if (!solicitud) throw new NotFoundException(`Solicitud ${codigo} no encontrada`);

    const pago = solicitud.pagos.find((p) => p.codigo_orden === codigoOrden);
    if (!pago) throw new NotFoundException(`Pago ${codigoOrden} no encontrado`);

    if (pago.estado === 'PAGADO' || pago.estado === 'CONFIRMADO') {
      return { message: 'Pago ya procesado', estado: pago.estado };
    }

    // 1. Marcar pago como PAGADO
    await this.prisma.pago.update({
      where: { id: pago.id },
      data: {
        estado: 'PAGADO',
        fecha_verificacion: new Date(),
      },
    });

    // 2. Transicionar solicitud
    await this.prisma.solicitud.update({
      where: { id: solicitud.id },
      data: { estado: 'PAGO_CONFIRMADO' },
    });

    await this.prisma.historialSolicitud.create({
      data: {
        solicitud_id: solicitud.id,
        estado_anterior: 'PENDIENTE_PAGO',
        estado_nuevo: 'PAGO_CONFIRMADO',
        observacion: `Pago confirmado por webhook simulado: ${codigoOrden}`,
      },
    });

    this.logger.log(`✅ Pago confirmado: ${codigo} → ${codigoOrden}`);

    return {
      message: 'Pago confirmado exitosamente (simulado)',
      pago: { id: pago.id, estado: 'PAGADO' },
      solicitud: { codigo, estado: 'PAGO_CONFIRMADO' },
    };
  }

  /**
   * Cambia el estado de una solicitud (con state machine)
   */
  async cambiarEstado(
    codigo: string,
    usuarioId: number,
    rolUsuario: string,
    dto: CambiarEstadoDto,
  ) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
    });

    if (!solicitud) throw new NotFoundException(`Solicitud ${codigo} no encontrada`);

    const estadoActual = solicitud.estado;
    const estadoNuevo = dto.estado;

    // 1. Validar que la transición es permitida
    const permitidos = TRANSICIONES_PERMITIDAS[estadoActual] || [];
    if (!permitidos.includes(estadoNuevo)) {
      throw new BadRequestException(
        `Transición no permitida: ${estadoActual} → ${estadoNuevo}`,
      );
    }

    // 2. Validar que el rol puede hacer la transición
    const key = `${estadoActual}:${estadoNuevo}`;
    const rolesPermitidos = ROLES_TRANSICION[key] || ROLES_TRANSICION['*:ANULADO'] || [];

    // El dueño puede hacer ciertas transiciones aunque no sea ADMIN
    const esDuenio = solicitud.usuario_id === usuarioId;
    const puedeComoDuenio = esDuenio && rolesPermitidos.includes('EXTERNO');
    const puedeComoRol = rolesPermitidos.includes(rolUsuario);

    if (!puedeComoDuenio && !puedeComoRol) {
      throw new ForbiddenException(
        `No tienes permiso para la transición ${estadoActual} → ${estadoNuevo}`,
      );
    }

    // 3. Actualizar estado
    await this.prisma.solicitud.update({
      where: { id: solicitud.id },
      data: {
        estado: estadoNuevo as EstadoSolicitud,
        fecha_aprobacion: estadoNuevo === 'APROBADO' ? new Date() : solicitud.fecha_aprobacion,
      },
    });

    // 4. Escribir en historial (usuario externo o interno según rol)
    const esExterno = rolUsuario === 'EXTERNO';
    await this.prisma.historialSolicitud.create({
      data: {
        solicitud_id: solicitud.id,
        usuario_id: esExterno ? usuarioId : null,
        usuario_interno_id: esExterno ? null : usuarioId,
        estado_anterior: estadoActual,
        estado_nuevo: estadoNuevo,
        observacion: dto.observacion || `Transición a ${estadoNuevo}`,
      },
    });

    this.logger.log(`🔄 Transición: ${codigo} ${estadoActual} → ${estadoNuevo}`);

    return {
      message: 'Estado actualizado',
      solicitud: {
        codigo,
        estado_anterior: estadoActual,
        estado_nuevo: estadoNuevo,
      },
    };
  }
}