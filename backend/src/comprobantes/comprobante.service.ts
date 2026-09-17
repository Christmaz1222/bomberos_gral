import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../certificados/pdf.service';
import { QrService } from '../certificados/qr.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ComprobanteService {
  private readonly logger = new Logger(ComprobanteService.name);
  private readonly COMPROBANTES_DIR = path.join(process.cwd(), 'uploads', 'comprobantes');

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private qrService: QrService,
  ) {
    // Asegurar que la carpeta existe
    if (!fs.existsSync(this.COMPROBANTES_DIR)) {
      fs.mkdirSync(this.COMPROBANTES_DIR, { recursive: true });
    }
  }

  /**
   * Genera el comprobante PDF de una solicitud
   * Retorna la ruta del archivo generado
   */
  async generarComprobante(codigo: string): Promise<string> {
    // 1. Buscar la solicitud con datos completos
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
        pagos: true,
        sippci_datos: true,
        reglamentacion_datos: true,
        turismo_datos: true,
        capacitacion_datos: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${codigo} no encontrada`);
    }

    // 2. Determinar tipo_formulario desde datos_especificos
    const datosDominio =
      solicitud.sippci_datos ||
      solicitud.reglamentacion_datos ||
      solicitud.turismo_datos ||
      solicitud.capacitacion_datos;

    const datosEspecificos = (datosDominio?.datos_especificos as any) || {};
    const tipoFormulario = datosEspecificos.tipo_formulario || 'GENERICO';

    // 3. Determinar nombre del titular y documento (NIT o CI)
    const esJuridica =
      solicitud.tipo_persona === 'JURIDICA' || solicitud.tipo_persona === 'EMPRESA';
    const razonSocial =
      solicitud.empresa?.razon_social || datosEspecificos.nombre_razon_social;
    const nit =
      solicitud.empresa?.nit || datosEspecificos.nit || datosEspecificos.nit_ci;

    const nombreTitular =
      esJuridica && razonSocial
        ? razonSocial
        : solicitud.usuario?.nombre_completo || '—';

    const ciNit =
      esJuridica && nit
        ? `NIT: ${nit}`
        : `CI: ${solicitud.usuario?.ci || datosEspecificos.ci || '—'}`;

    // 4. Generar QR de verificación
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const qrDataUrl = await this.qrService.generarDataUrl(codigo, baseUrl);

    // 5. Calcular monto del depósito (si existe)
    let montoDeposito: string | null = null;
    if (datosEspecificos.monto_deposito) {
      montoDeposito = `Bs ${Number(datosEspecificos.monto_deposito).toFixed(2)}`;
    } else if (solicitud.pagos && solicitud.pagos.length > 0) {
      const pago = solicitud.pagos[0];
      montoDeposito = `${pago.monto_bs} Bs`;
    }

    // 6. Datos para el PDF
    const datosComprobante = {
      codigo: solicitud.codigo,
      tipo_formulario: tipoFormulario,
      nombre_titular: nombreTitular,
      ci_nit: ciNit,
      correo: solicitud.usuario?.email || datosEspecificos.correo || '—',
      telefono: solicitud.usuario?.telefono || datosEspecificos.telefono || '—',
      modulo: solicitud.submodulo.modulo.nombre,
      submodulo: solicitud.submodulo.nombre,
      fecha_solicitud: solicitud.fecha_solicitud,
      estado: solicitud.estado,
      monto_deposito: montoDeposito,
      qr_data_url: qrDataUrl,
    };

    // 7. Generar PDF
    const pdfFilename = `${codigo}.pdf`;
    const pdfPath = path.join(this.COMPROBANTES_DIR, pdfFilename);

    await this.pdfService.generarComprobante(datosComprobante, pdfPath);

    this.logger.log(`📄 Comprobante generado: ${codigo}`);

    return pdfPath;
  }

  /**
   * Verifica si el comprobante ya existe, si no lo genera
   */
  async obtenerComprobante(codigo: string): Promise<string> {
    const pdfPath = path.join(this.COMPROBANTES_DIR, `${codigo}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      this.logger.log(`📄 Generando comprobante on-demand: ${codigo}`);
      await this.generarComprobante(codigo);
    }

    return pdfPath;
  }
}
