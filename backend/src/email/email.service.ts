import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Envía OTP al email. En fase autoverificación es mock (log).
   * En producción integrar nodemailer con SMTP real.
   * Nunca bloquea el flujo si falla (caller debe usar try-catch).
   */
  async sendOTP(email: string, otp: string): Promise<void> {
    // TODO: Integrar nodemailer cuando haya SMTP configurado
    // Ejemplo futuro:
    // await transporter.sendMail({ to: email, subject: 'Código de verificación', text: `Tu código: ${otp}` })

    this.logger.log(`📧 [MOCK] OTP ${otp} -> ${email} (expira 10 min)`);

    // Simular latencia mínima sin bloquear
    await Promise.resolve();
  }

  async sendCredentials(email: string, password: string): Promise<void> {
    this.logger.log(`📧 [MOCK] Credenciales -> ${email}: ${password}`);
    await Promise.resolve();
  }

  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    this.logger.log(`📧 [MOCK] Reset link -> ${email}: ${resetLink}`);
    await Promise.resolve();
  }
}
