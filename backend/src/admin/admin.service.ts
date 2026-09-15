import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { TRANSICIONES_PERMITIDAS, ROLES_TRANSICION } from '../solicitudes/enums/transiciones';
import { QuerySolicitudesAdminDto, CambiarEstadoAdminDto } from './dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * KPIs del dashboard
   */
  async obtenerStats() {
    const [pendientes, enRevision, observados, aprobados, certificadosEmitidos, totalSolicitudes] =
      await Promise.all([
        this.prisma.solicitud.count({
          where: { estado: { in: ['BORRADOR', 'PENDIENTE_PAGO'] } as any },
        }),
        this.prisma.solicitud.count({
          where: { estado: { in: ['PAGO_CONFIRMADO', 'EN_VERIFICACION'] } as any },
        }),
        this.prisma.solicitud.count({ where: { estado: 'OBSERVADO' as any } }),
        this.prisma.solicitud.count({ where: { estado: 'APROBADO' as any } }),
        this.prisma.certificadoHabilitacion.count({ where: { estado: 'VIGENTE' } }),
        this.prisma.solicitud.count(),
      ]);

    // Certificados por vencer (próximos 30 días)
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() + 30);

    const renovacionesProximas = await this.prisma.certificadoHabilitacion.count({
      where: {
        estado: 'VIGENTE',
        fecha_vencimiento: {
          lte: treintaDias,
          gte: new Date(),
        },
      },
    });

    // Usuarios registrados
    const totalUsuarios = await this.prisma.usuario.count({ where: { activo: true } });

    // Solicitudes hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const solicitudesHoy = await this.prisma.solicitud.count({
      where: { created_at: { gte: hoy } },
    });

    // Últimas 24h
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const solicitudesUltimas24h = await this.prisma.solicitud.count({
      where: { created_at: { gte: hace24h } },
    });

    this.logger.log(`📊 Stats generados: ${totalSolicitudes} solicitudes`);

    return {
      kpis: {
        pendientes: {
          valor: pendientes,
          label: 'Pendientes',
          badge: 'Requiere asignación',
        },
        enRevision: {
          valor: enRevision,
          label: 'En Revisión',
          badge: 'Asignados en campo',
        },
        observados: {
          valor: observados,
          label: 'Observados',
          badge: 'Por subsanar',
        },
        renovaciones: {
          valor: renovacionesProximas,
          label: 'Renovaciones',
          badge: '< 30 días',
        },
        cursos: {
          valor: 19, // Mock hasta Bloque I
          label: 'Cursos Activos',
          badge: '482 brigadistas (mock)',
        },
        certificados: {
          valor: certificadosEmitidos,
          label: 'Certificados',
          badge: 'Firma digital válida',
        },
      },
      resumen: {
        totalSolicitudes,
        totalUsuarios,
        solicitudesHoy,
        solicitudesUltimas24h,
        aprobados,
        certificadosEmitidos,
      },
      meta: {
        generadoEn: new Date().toISOString(),
      },
    };
  }

  /**
   * Lista de solicitudes paginada
   */
  async listarSolicitudes(query: QuerySolicitudesAdminDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.estado) {
      where.estado = query.estado;
    }

    if (query.modulo) {
      where.submodulo = {
        modulo: {
          nombre: { contains: query.modulo, mode: 'insensitive' },
        },
      };
    }

    if (query.q) {
      where.OR = [
        { codigo: { contains: query.q, mode: 'insensitive' } },
        { usuario: { nombre_completo: { contains: query.q, mode: 'insensitive' } } },
        { usuario: { ci: { contains: query.q, mode: 'insensitive' } } },
        { empresa: { razon_social: { contains: query.q, mode: 'insensitive' } } },
        { empresa: { nit: { contains: query.q, mode: 'insensitive' } } },
      ];
    }

    const [solicitudes, total] = await Promise.all([
      this.prisma.solicitud.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          usuario: {
            select: { id: true, nombre_completo: true, ci: true, email: true },
          },
          empresa: {
            select: { id: true, razon_social: true, nit: true },
          },
          submodulo: {
            include: { modulo: { select: { nombre: true } } },
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
        tipo_persona: s.tipo_persona,
        fecha_solicitud: s.fecha_solicitud,
        modulo: s.submodulo.modulo.nombre,
        submodulo: s.submodulo.nombre,
        solicitante: {
          nombre: s.usuario?.nombre_completo,
          ci: s.usuario?.ci,
          email: s.usuario?.email,
        },
        empresa: s.empresa
          ? {
              razon_social: s.empresa.razon_social,
              nit: s.empresa.nit,
            }
          : null,
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
   * Detalle de una solicitud (para admin)
   */
  async detalleSolicitud(codigo: string) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      include: {
        usuario: {
          select: {
            id: true,
            nombre_completo: true,
            ci: true,
            email: true,
            telefono: true,
          },
        },
        empresa: true,
        submodulo: { include: { modulo: true } },
        historial: {
          orderBy: { created_at: 'asc' },
        },
        documentos: true,
        pagos: true,
        certificados: true,
        sippci_datos: true,
        reglamentacion_datos: true,
        turismo_datos: true,
        capacitacion_datos: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    return solicitud;
  }

  /**
   * Alertas del sistema
   */
  async listarAlertas(soloNoLeidas: boolean = false) {
    // 1. Alertas de la BD
    const alertasBd = await this.prisma.alertaAdmin.findMany({
      where: soloNoLeidas ? { leida: false } : {},
      orderBy: [{ prioridad: 'desc' }, { created_at: 'desc' }],
      take: 50,
    });

    // 2. Alertas generadas (certificados por vencer)
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() + 30);

    const certificadosPorVencer = await this.prisma.certificadoHabilitacion.findMany({
      where: {
        estado: 'VIGENTE',
        fecha_vencimiento: {
          lte: treintaDias,
          gte: new Date(),
        },
      },
      take: 10,
      include: {
        solicitud: {
          include: {
            usuario: { select: { nombre_completo: true } },
            empresa: { select: { razon_social: true } },
            submodulo: { include: { modulo: true } },
          },
        },
      },
    });

    const alertasGeneradas = certificadosPorVencer.map((c) => {
      const diasRestantes = Math.ceil(
        (c.fecha_vencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      return {
        id: `gen-${c.id}`,
        tipo: 'VENCIMIENTO',
        prioridad: diasRestantes <= 7 ? 'CRITICA' : 'ALTA',
        titulo: `Certificado por vencer: ${c.numero_registro}`,
        mensaje: `${c.solicitud?.empresa?.razon_social || c.solicitud?.usuario?.nombre_completo || ''} — vence en ${diasRestantes} días`,
        url_accion: `/admin/certificados/${c.numero_registro}`,
        leida: false,
        created_at: new Date().toISOString(),
        origen: 'SISTEMA',
      };
    });

    return {
      data: [
        ...alertasGeneradas,
        ...alertasBd.map((a) => ({ ...a, origen: 'BD' })),
      ],
      meta: {
        total: alertasGeneradas.length + alertasBd.length,
        noLeidas: alertasBd.filter((a) => !a.leida).length + alertasGeneradas.length,
      },
    };
  }

  /**
   * Estado de guardia (mock hasta Bloque K)
   */
  async obtenerGuardia() {
    return {
      oficial: 'My. C. Villarroel',
      estacionesConectadas: 9,
      estacionesTotal: 9,
      tiempoPromedioHoras: 48,
      metaHoras: 72,
      inspectoresHabilitados: 32,
      turno: 'DIURNO',
      fecha: new Date().toISOString(),
      nota: 'Mock hasta implementar Bloque K (mantenimiento periódico)',
    };
  }

  /**
   * Obtiene los estados a los que puede transicionar una solicitud,
   * considerando el estado actual y el rol del usuario interno.
   */
  async obtenerEstadosPermitidos(codigo: string, rol: string) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      select: { id: true, codigo: true, estado: true },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    const estadoActual = solicitud.estado;
    const permitidos = TRANSICIONES_PERMITIDAS[estadoActual] || [];

    const permitidosParaRol = permitidos.filter((estadoDestino) => {
      const key = `${estadoActual}:${estadoDestino}`;
      const rolesPermitidos = ROLES_TRANSICION[key] || ROLES_TRANSICION['*:ANULADO'] || [];
      return rolesPermitidos.includes(rol);
    });

    return {
      codigo: solicitud.codigo,
      estadoActual,
      estadosPermitidos: permitidosParaRol,
      todos: permitidos,
    };
  }

  /**
   * Cambia el estado de una solicitud (admin)
   */
  async cambiarEstado(
    codigo: string,
    usuarioId: number,
    rol: string,
    dto: CambiarEstadoAdminDto,
  ) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    const estadoActual = solicitud.estado;
    const estadoNuevo = dto.estado;

    const permitidos = TRANSICIONES_PERMITIDAS[estadoActual] || [];
    if (!permitidos.includes(estadoNuevo)) {
      throw new BadRequestException(
        `Transición no permitida: ${estadoActual} → ${estadoNuevo}. ` +
          `Estados permitidos: ${permitidos.join(', ') || 'ninguno'}`,
      );
    }

    const key = `${estadoActual}:${estadoNuevo}`;
    const rolesPermitidos = ROLES_TRANSICION[key] || ROLES_TRANSICION['*:ANULADO'] || [];

    if (!rolesPermitidos.includes(rol)) {
      throw new ForbiddenException(
        `El rol ${rol} no puede realizar la transición ${estadoActual} → ${estadoNuevo}. ` +
          `Roles permitidos: ${rolesPermitidos.join(', ') || 'ninguno'}`,
      );
    }

    const fechaAprobacion =
      estadoNuevo === 'APROBADO' ? new Date() : solicitud.fecha_aprobacion;

    await this.prisma.solicitud.update({
      where: { id: solicitud.id },
      data: {
        estado: estadoNuevo as any,
        fecha_aprobacion: fechaAprobacion,
      },
    });

    await this.prisma.historialSolicitud.create({
      data: {
        solicitud_id: solicitud.id,
        usuario_interno_id: usuarioId,
        estado_anterior: estadoActual,
        estado_nuevo: estadoNuevo,
        observacion: dto.observacion || `Cambio de estado por ${rol}`,
      },
    });

    this.logger.log(
      `🔄 Estado cambiado: ${codigo} ${estadoActual} → ${estadoNuevo} por ${rol}`,
    );

    return {
      message: 'Estado actualizado exitosamente',
      solicitud: {
        codigo,
        estado_anterior: estadoActual,
        estado_nuevo: estadoNuevo,
        fecha_aprobacion: fechaAprobacion,
      },
    };
  }

  /**
   * Marca una alerta como leída
   */
  async marcarAlertaLeida(alertaId: number | string) {
    // Alertas generadas dinámicamente (gen-XX) no se persisten en BD
    if (typeof alertaId === 'string' && alertaId.startsWith('gen-')) {
      return {
        message: 'Alerta generada dinámicamente — no persistida',
        alerta: { id: alertaId, leida: true },
      };
    }

    const id = parseInt(String(alertaId), 10);
    if (Number.isNaN(id)) {
      throw new NotFoundException(`Alerta ${alertaId} no encontrada`);
    }

    const alerta = await this.prisma.alertaAdmin.findUnique({
      where: { id },
    });

    if (!alerta) {
      throw new NotFoundException(`Alerta ${alertaId} no encontrada`);
    }

    await this.prisma.alertaAdmin.update({
      where: { id },
      data: { leida: true },
    });

    this.logger.log(`📬 Alerta marcada como leída: ${id}`);

    return {
      message: 'Alerta marcada como leída',
      alerta: { id, leida: true },
    };
  }

  /**
   * Marca todas las alertas del admin como leídas
   */
  async marcarTodasLeidas(adminId?: number) {
    const result = await this.prisma.alertaAdmin.updateMany({
      where: {
        leida: false,
        ...(adminId ? { admin_id: adminId } : {}),
      },
      data: { leida: true },
    });

    this.logger.log(`📬 Alertas marcadas como leídas: ${result.count}`);

    return {
      message: `${result.count} alertas marcadas como leídas`,
      count: result.count,
    };
  }

  /**
   * Descarga un documento de una solicitud (admin)
   */
  async descargarDocumento(codigo: string, documentoId: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      select: { id: true, codigo: true },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    const documento = await this.prisma.documentoSolicitud.findFirst({
      where: {
        id: documentoId,
        solicitud_id: solicitud.id,
      },
    });

    if (!documento) {
      throw new NotFoundException('Documento no encontrado');
    }

    const rutaCompleta = path.join(process.cwd(), documento.ruta_archivo);

    if (!fs.existsSync(rutaCompleta)) {
      throw new NotFoundException('Archivo físico no encontrado en el servidor');
    }

    this.logger.log(`📥 Descarga admin: ${codigo} → ${documento.nombre_original}`);

    return {
      ruta: rutaCompleta,
      nombre_original: documento.nombre_original,
      tipo_documento: documento.tipo_documento,
    };
  }
}