import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Consulta pública por código de solicitud
   * Retorna SOLO información no sensible
   */
  async consultarPorCodigo(codigo: string) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      include: {
        usuario: {
          select: { nombre_completo: true },
        },
        empresa: {
          select: { razon_social: true },
        },
        submodulo: {
          include: {
            modulo: { select: { nombre: true } },
          },
        },
        historial: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: { created_at: true },
        },
        certificados: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: {
            numero_registro: true,
            estado: true,
            fecha_emision: true,
            fecha_vencimiento: true,
          },
        },
      },
    });

    if (!solicitud) {
      throw new NotFoundException('No se encontró una solicitud con ese código');
    }

    const nombreCompleto =
      solicitud.tipo_persona === 'JURIDICA' && solicitud.empresa
        ? solicitud.empresa.razon_social
        : solicitud.usuario?.nombre_completo || '—';

    const nombrePublico = this.enmascararNombre(nombreCompleto);

    const ultimaActualizacion =
      solicitud.historial[0]?.created_at || solicitud.updated_at;

    return {
      codigo: solicitud.codigo,
      estado: solicitud.estado,
      modulo: solicitud.submodulo.modulo.nombre,
      submodulo: solicitud.submodulo.nombre,
      tipo_persona: solicitud.tipo_persona,
      titular: nombrePublico,
      fecha_solicitud: solicitud.fecha_solicitud,
      fecha_ultima_actualizacion: ultimaActualizacion,
      tiene_comprobante: true,
      certificado:
        solicitud.certificados && solicitud.certificados.length > 0
          ? {
              numero_registro: solicitud.certificados[0].numero_registro,
              estado: solicitud.certificados[0].estado,
              fecha_emision: solicitud.certificados[0].fecha_emision,
              fecha_vencimiento: solicitud.certificados[0].fecha_vencimiento,
            }
          : null,
    };
  }

  /**
   * Enmascara un nombre para mostrar solo el primer nombre + inicial
   * Ej: "Juan Pérez Mamani" → "Juan P."
   * Ej: "Empresa S.R.L." → "Empresa S.R.L." (empresas no se enmascaran)
   */
  private enmascararNombre(nombre: string): string {
    if (!nombre || nombre === '—') return '—';

    // Si parece una empresa (contiene S.R.L., S.A., LTDA, etc.), no enmascarar
    if (/S\.?R\.?L\.?|S\.?A\.?|LTDA|CORP/i.test(nombre)) {
      return nombre;
    }

    const partes = nombre.trim().split(/\s+/);
    if (partes.length === 1) return partes[0];

    const primerNombre = partes[0];
    const primerApellido = partes[1] || partes[partes.length - 1];
    return `${primerNombre} ${primerApellido.charAt(0)}.`;
  }

  /**
   * Consulta pública por QR de certificado
   * Versión wrapper del endpoint existente de certificados
   */
  async consultarPorCodigoQr(codigoQr: string) {
    const certificado = await this.prisma.certificadoHabilitacion.findUnique({
      where: { codigo_qr: codigoQr },
      include: {
        solicitud: {
          include: {
            usuario: { select: { nombre_completo: true } },
            empresa: { select: { razon_social: true } },
            submodulo: {
              include: { modulo: { select: { nombre: true } } },
            },
          },
        },
      },
    });

    if (!certificado) {
      return {
        valido: false,
        mensaje: 'Certificado no encontrado o inválido',
      };
    }

    const hoy = new Date();
    const vigente =
      certificado.estado === 'VIGENTE' && certificado.fecha_vencimiento > hoy;

    const solicitud = certificado.solicitud;
    const nombreCompleto =
      solicitud?.tipo_persona === 'JURIDICA' && solicitud.empresa
        ? solicitud.empresa.razon_social
        : solicitud?.usuario?.nombre_completo || '—';

    return {
      valido: vigente,
      estado: certificado.estado,
      numero_registro: certificado.numero_registro,
      titular: this.enmascararNombre(nombreCompleto),
      modulo: solicitud?.submodulo?.modulo.nombre,
      submodulo: solicitud?.submodulo?.nombre,
      fecha_emision: certificado.fecha_emision,
      fecha_vencimiento: certificado.fecha_vencimiento,
      mensaje: vigente
        ? 'Certificado válido'
        : 'Certificado vencido o no vigente',
    };
  }
}