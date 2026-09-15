import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);

  /**
   * Genera un código QR con la URL de verificación pública
   * Retorna un data URL (base64) listo para incrustar en PDF
   */
  async generarDataUrl(codigoQr: string, baseUrl: string): Promise<string> {
    const url = `${baseUrl}/api/certificados/verificar/${codigoQr}`;

    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 200,
      margin: 1,
      color: {
        dark: '#1A3A5C',
        light: '#FFFFFF',
      },
    });

    this.logger.log(`📱 QR generado para: ${codigoQr}`);
    return dataUrl;
  }

  /**
   * Genera un buffer PNG del QR (para guardar en disco si se requiere)
   */
  async generarBuffer(codigoQr: string, baseUrl: string): Promise<Buffer> {
    const url = `${baseUrl}/api/certificados/verificar/${codigoQr}`;
    return QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 200,
      margin: 1,
    });
  }
}