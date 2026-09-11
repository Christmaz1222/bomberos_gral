import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dns from 'dns';
import * as nodemailer from 'nodemailer';

dns.setDefaultResultOrder('ipv4first');

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isMock: boolean;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: false,
        family: 4,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
      this.isMock = false;
      this.logger.log('✅ EmailService configurado con SMTP real');
    } else {
      this.isMock = true;
      this.logger.warn('⚠️ EmailService en modo MOCK (sin SMTP configurado)');
    }
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    const subject = 'Código de verificación SIPPCI';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C41E3A;">Dirección Nacional de Bomberos</h2>
        <p>Su código de verificación es:</p>
        <h1 style="font-size: 36px; letter-spacing: 8px; color: #1A3A5C;">${otp}</h1>
        <p>Este código expira en 10 minutos.</p>
        <p style="color: #666; font-size: 12px;">
          Si no solicitó este código, ignore este mensaje.
        </p>
      </div>
    `;

    if (this.isMock || !this.transporter) {
      this.logger.log(`🔐 [MOCK] OTP para ${email}: ${otp}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@sippci.bo'),
        to: email,
        subject,
        html,
      });
      this.logger.log(`✅ OTP enviado a ${email}`);
    } catch (error) {
      this.logger.error(`❌ Error enviando OTP a ${email}`, error);
      this.logger.log(`🔐 [FALLBACK] OTP para ${email}: ${otp}`);
    }
  }

  async sendCredentials(email: string, password: string): Promise<void> {
    if (this.isMock || !this.transporter) {
      this.logger.log(`📧 [MOCK] Credenciales -> ${email}: ${password}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@sippci.bo'),
        to: email,
        subject: 'Sus credenciales SIPPCI',
        html: `<p>Contraseña: <strong>${password}</strong></p>`,
      });
      this.logger.log(`✅ Credenciales enviadas a ${email}`);
    } catch (error) {
      this.logger.error(`❌ Error enviando credenciales a ${email}`, error);
    }
  }

  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    if (this.isMock || !this.transporter) {
      this.logger.log(`📧 [MOCK] Reset link -> ${email}: ${resetLink}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@sippci.bo'),
        to: email,
        subject: 'Recuperación de contraseña SIPPCI',
        html: `<p>Haga clic para resetear su contraseña: <a href="${resetLink}">${resetLink}</a></p>`,
      });
      this.logger.log(`✅ Reset link enviado a ${email}`);
    } catch (error) {
      this.logger.error(`❌ Error enviando reset link a ${email}`, error);
    }
  }
}
