import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';

interface CertificadoData {
  numero_registro: string;
  codigo_qr: string;
  nombre_titular: string;
  ci_titular: string;
  empresa?: string;
  nit?: string;
  modulo: string;
  submodulo: string;
  fecha_emision: Date;
  fecha_vencimiento: Date;
  qr_data_url: string;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  /**
   * Genera el PDF del certificado
   */
  async generarCertificado(data: CertificadoData, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 40, bottom: 40, left: 60, right: 60 },
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // ============ BORDE DECORATIVO ============
        doc
          .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
          .lineWidth(3)
          .strokeColor('#C41E3A')
          .stroke();

        doc
          .rect(26, 26, doc.page.width - 52, doc.page.height - 52)
          .lineWidth(1)
          .strokeColor('#1A3A5C')
          .stroke();

        // ============ ENCABEZADO ============
        doc
          .fillColor('#1A3A5C')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('ESTADO PLURINACIONAL DE BOLIVIA', 60, 60, { align: 'center' });

        doc.fontSize(9).font('Helvetica').text('POLICÍA BOLIVIANA', { align: 'center' });

        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('DIRECCIÓN NACIONAL DE BOMBEROS', { align: 'center' });

        // ============ TÍTULO ============
        doc
          .moveDown(1.5)
          .fillColor('#C41E3A')
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('CERTIFICADO DE HABILITACIÓN', { align: 'center' });

        doc
          .moveDown(0.3)
          .fillColor('#1A3A5C')
          .fontSize(12)
          .font('Helvetica')
          .text(`N° ${data.numero_registro}`, { align: 'center' });

        // ============ CUERPO ============
        doc
          .moveDown(1.5)
          .fillColor('#333333')
          .fontSize(11)
          .font('Helvetica')
          .text('La Dirección Nacional de Bomberos certifica que:', 60, doc.y, {
            align: 'center',
            width: doc.page.width - 120,
          });

        // Nombre del titular
        doc
          .moveDown(0.8)
          .fillColor('#1A3A5C')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(data.nombre_titular.toUpperCase(), { align: 'center' });

        // CI
        doc
          .moveDown(0.3)
          .fillColor('#333333')
          .fontSize(10)
          .font('Helvetica')
          .text(`C.I. ${data.ci_titular}`, { align: 'center' });

        // Empresa (si aplica)
        if (data.empresa) {
          doc.moveDown(0.5).fontSize(11).font('Helvetica-Bold').text(data.empresa, { align: 'center' });

          if (data.nit) {
            doc.fontSize(9).font('Helvetica').text(`NIT: ${data.nit}`, { align: 'center' });
          }
        }

        // Descripción del trámite
        doc
          .moveDown(0.8)
          .fontSize(10)
          .font('Helvetica')
          .text(
            `Ha cumplido con los requisitos establecidos en el Reglamento de la Ley 449 para el trámite de ${data.submodulo} (${data.modulo}), habiendo aprobado las inspecciones técnicas correspondientes.`,
            60,
            doc.y,
            { align: 'center', width: doc.page.width - 120 },
          );

        // ============ FECHAS ============
        const fechaEmision = data.fecha_emision.toLocaleDateString('es-BO');
        const fechaVencimiento = data.fecha_vencimiento.toLocaleDateString('es-BO');

        doc
          .moveDown(1.5)
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#1A3A5C')
          .text(`Válido desde: ${fechaEmision}`, { align: 'center' });

        doc.moveDown(0.2).text(`Válido hasta: ${fechaVencimiento}`, { align: 'center' });

        // ============ QR + FIRMA ============
        const qrY = doc.page.height - 160;

        // QR en la izquierda
        if (data.qr_data_url) {
          const base64Data = data.qr_data_url.replace(/^data:image\/png;base64,/, '');
          const qrBuffer = Buffer.from(base64Data, 'base64');
          doc.image(qrBuffer, 80, qrY, { width: 100, height: 100 });

          doc
            .fontSize(7)
            .font('Helvetica')
            .fillColor('#666666')
            .text('Escanee para verificar', 80, qrY + 105, {
              width: 100,
              align: 'center',
            });
        }

        // Firma en la derecha
        doc
          .moveTo(doc.page.width - 260, qrY + 60)
          .lineTo(doc.page.width - 100, qrY + 60)
          .strokeColor('#333333')
          .stroke();

        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor('#1A3A5C')
          .text('Dirección Nacional de Bomberos', doc.page.width - 260, qrY + 70, {
            width: 160,
            align: 'center',
          });

        doc
          .fontSize(7)
          .font('Helvetica')
          .fillColor('#666666')
          .text('Autoridad Competente', doc.page.width - 260, qrY + 85, {
            width: 160,
            align: 'center',
          });

        // ============ PIE ============
        doc
          .fontSize(7)
          .font('Helvetica')
          .fillColor('#999999')
          .text(
            `Código de verificación: ${data.codigo_qr} | Documento generado electrónicamente`,
            60,
            doc.page.height - 50,
            { align: 'center', width: doc.page.width - 120 },
          );

        // Finalizar
        doc.end();

        stream.on('finish', () => {
          this.logger.log(`📄 PDF generado: ${outputPath}`);
          resolve(outputPath);
        });

        stream.on('error', (err) => {
          this.logger.error(`❌ Error generando PDF: ${err.message}`);
          reject(err);
        });
      } catch (error) {
        this.logger.error(`❌ Error PDF: ${error.message}`);
        reject(error);
      }
    });
  }
}