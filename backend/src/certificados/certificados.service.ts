import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { EstadoSolicitud } from '@prisma/client';
import { PdfService } from './pdf.service';
import { QrService } from './qr.service';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class CertificadosService {
  private readonly logger = new Logger(CertificadosService.name);
  private readonly CERTIFICADOS_DIR = path.join(process.cwd(), 'uploads', 'certificados');

  private readonly MODULO_ABREV: Record<string, string> = {
    'SIPPCI': 'SIPPCI',
    'REGLAMENTACION': 'REGLAM',
    'TURISMO': 'TURIS',
    'CAPACITACION': 'CAPAC',
  };

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private qrService: QrService,
  ) {}

  /**
   * Genera el número de registro del certificado
   * Formato: {ABREV}-{AÑO}-{SECUENCIAL}
   */
  private async generarNumeroRegistro(moduloNombre: string): Promise<string> {
    const anio = new Date().getFullYear();
    const moduloUpper = moduloNombre.toUpperCase();
    const abrev = this.MODULO_ABREV[moduloUpper] || moduloUpper.substring(0, 6);

    const prefijo = `${abrev}-${anio}-`;
    const count = await this.prisma.certificadoHabilitacion.count({
      where: { numero_registro: { startsWith: prefijo } },
    });

    const secuencial = (count + 1).toString().padStart(5, '0');
    return `${prefijo}${secuencial}`;
  }

  /**
   * Emite un certificado para una solicitud
   */
  async emitirCertificado(codigo: string, usuarioId: number, rol: string, observacion?: string) {
    // 1. Verificar que la solicitud existe
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      include: {
        usuario: true,
        empresa: true,
        submodulo: { include: { modulo: true } },
        certificados: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    // 2. Verificar permisos (solo ADMIN / interno)
    if (rol !== 'ADMIN' && rol !== 'INTERNO') {
      throw new ForbiddenException('Solo administradores pueden emitir certificados');
    }

    // 3. Verificar estado
    if (!['INSPECCION', 'APROBADO'].includes(solicitud.estado)) {
      throw new BadRequestException(
        `Solo se puede emitir desde INSPECCION o APROBADO. Estado actual: ${solicitud.estado}`,
      );
    }

    // 4. Verificar que no exista certificado ya
    if (solicitud.certificados.length > 0) {
      throw new BadRequestException('Esta solicitud ya tiene un certificado emitido');
    }

    // 5. Generar datos
    const numeroRegistro = await this.generarNumeroRegistro(solicitud.submodulo.modulo.nombre);
    const codigoQr = randomUUID();
    const fechaEmision = new Date();

    // Vigencia desde ParametroSistema
    const paramVigencia = await this.prisma.parametroSistema.findUnique({
      where: { clave: 'VIGENCIA_CERTIFICADO_ANIOS' },
    });
    const vigenciaAnios = parseInt(paramVigencia?.valor || '2', 10);
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + vigenciaAnios);

    // 6. Generar QR
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const qrDataUrl = await this.qrService.generarDataUrl(codigoQr, baseUrl);

    // 7. Generar PDF
    if (!fs.existsSync(this.CERTIFICADOS_DIR)) {
      fs.mkdirSync(this.CERTIFICADOS_DIR, { recursive: true });
    }

    const pdfFilename = `${numeroRegistro}.pdf`;
    const pdfPath = path.join(this.CERTIFICADOS_DIR, pdfFilename);

    // Determinar nombre y CI del titular
    let nombreTitular: string;
    let ciTitular: string;
    let empresaNombre: string | undefined;
    let nit: string | undefined;

    if (solicitud.tipo_persona === 'JURIDICA' && solicitud.empresa) {
      nombreTitular = solicitud.empresa.razon_social;
      ciTitular = '—';
      empresaNombre = solicitud.empresa.razon_social;
      nit = solicitud.empresa.nit;
    } else {
      nombreTitular = solicitud.usuario.nombre_completo;
      ciTitular = solicitud.usuario.ci;
    }

    await this.pdfService.generarCertificado(
      {
        numero_registro: numeroRegistro,
        codigo_qr: codigoQr,
        nombre_titular: nombreTitular,
        ci_titular: ciTitular,
        empresa: empresaNombre,
        nit,
        modulo: solicitud.submodulo.modulo.nombre,
        submodulo: solicitud.submodulo.nombre,
        fecha_emision: fechaEmision,
        fecha_vencimiento: fechaVencimiento,
        qr_data_url: qrDataUrl,
      },
      pdfPath,
    );

    // 8. Crear registro en BD
    const certificado = await this.prisma.certificadoHabilitacion.create({
      data: {
        numero_registro: numeroRegistro,
        codigo_qr: codigoQr,
        solicitud_id: solicitud.id,
        tipo_persona: solicitud.tipo_persona,
        usuario_id: solicitud.usuario_id,
        empresa_id: solicitud.empresa_id,
        fecha_emision: fechaEmision,
        fecha_vencimiento: fechaVencimiento,
        estado: 'VIGENTE',
      },
    });

    // 9. Transicionar solicitud a CERTIFICADO_EMITIDO
    await this.prisma.solicitud.update({
      where: { id: solicitud.id },
      data: { estado: 'CERTIFICADO_EMITIDO' as EstadoSolicitud },
    });

    // 10. Escribir en historial (interno que emitió)
    await this.prisma.historialSolicitud.create({
      data: {
        solicitud_id: solicitud.id,
        usuario_interno_id: usuarioId,
        estado_anterior: solicitud.estado,
        estado_nuevo: 'CERTIFICADO_EMITIDO',
        observacion: observacion || `Certificado emitido: ${numeroRegistro}`,
      },
    });

    this.logger.log(`📜 Certificado emitido: ${numeroRegistro} para solicitud ${codigo}`);

    return {
      message: 'Certificado emitido exitosamente',
      certificado: {
        id: certificado.id,
        numero_registro: certificado.numero_registro,
        codigo_qr: certificado.codigo_qr,
        fecha_emision: certificado.fecha_emision,
        fecha_vencimiento: certificado.fecha_vencimiento,
        estado: certificado.estado,
        archivo: `/uploads/certificados/${pdfFilename}`,
      },
    };
  }

  /**
   * Obtiene el certificado de una solicitud
   */
  async obtenerCertificado(codigo: string, usuarioId: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { codigo },
      include: { certificados: true },
    });

    if (!solicitud) throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    const certificado = solicitud.certificados[0];
    if (!certificado) throw new NotFoundException('Certificado no emitido aún');
    if (solicitud.usuario_id !== usuarioId) {
      throw new ForbiddenException('No tienes permiso');
    }

    return {
      certificado,
      archivo: `/uploads/certificados/${certificado.numero_registro}.pdf`,
    };
  }

  /**
   * Consulta pública por número de registro
   */
  async consultarPorNumero(numeroRegistro: string) {
    const certificado = await this.prisma.certificadoHabilitacion.findUnique({
      where: { numero_registro: numeroRegistro },
      include: {
        solicitud: {
          include: {
            usuario: { select: { nombre_completo: true, ci: true } },
            empresa: { select: { razon_social: true, nit: true } },
            submodulo: { include: { modulo: true } },
          },
        },
      },
    });

    if (!certificado) throw new NotFoundException('Certificado no encontrado');

    return {
      numero_registro: certificado.numero_registro,
      estado: certificado.estado,
      fecha_emision: certificado.fecha_emision,
      fecha_vencimiento: certificado.fecha_vencimiento,
      titular: certificado.solicitud?.usuario?.nombre_completo,
      empresa: certificado.solicitud?.empresa?.razon_social,
      modulo: certificado.solicitud?.submodulo?.modulo.nombre,
      submodulo: certificado.solicitud?.submodulo?.nombre,
    };
  }

  /**
   * Verificación pública por código QR
   */
  async verificarPorCodigoQr(codigoQr: string) {
    const certificado = await this.prisma.certificadoHabilitacion.findUnique({
      where: { codigo_qr: codigoQr },
      include: {
        solicitud: {
          include: {
            usuario: { select: { nombre_completo: true, ci: true } },
            empresa: { select: { razon_social: true, nit: true } },
            submodulo: { include: { modulo: true } },
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
    const vigente = certificado.estado === 'VIGENTE' && certificado.fecha_vencimiento > hoy;

    return {
      valido: vigente,
      estado: certificado.estado,
      numero_registro: certificado.numero_registro,
      titular: certificado.solicitud?.usuario?.nombre_completo,
      empresa: certificado.solicitud?.empresa?.razon_social,
      modulo: certificado.solicitud?.submodulo?.modulo.nombre,
      submodulo: certificado.solicitud?.submodulo?.nombre,
      fecha_emision: certificado.fecha_emision,
      fecha_vencimiento: certificado.fecha_vencimiento,
      mensaje: vigente ? 'Certificado válido' : 'Certificado vencido o no vigente',
    };
  }
}