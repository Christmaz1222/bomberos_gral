import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  /**
   * Genera un código OTP de 6 dígitos usando crypto.randomInt (seguro)
   */
  generateOTP(): string {
    return randomInt(100000, 1000000).toString();
  }

  /**
   * Hashea el OTP con bcrypt (salt 10)
   */
  async hashOTP(otp: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
  }

  /**
   * Verifica el OTP contra el hash
   */
  async verifyOTP(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }

  /**
   * Crea un nuevo código de verificación:
   * - Invalida códigos anteriores no usados del mismo tipo
   * - Crea registro con expiración 10 minutos
   * - Usa nombres exactos del schema: usuario_id, codigo_hash, created_at
   */
  async createVerificationCode(
    usuarioId: number,
    tipo: string,
  ): Promise<{ otp: string; codigo: any }> {
    const otp = this.generateOTP();
    const codigo_hash = await this.hashOTP(otp);
    const expira = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Invalida códigos anteriores no usados del mismo tipo
    await this.prisma.codigoVerificacion.updateMany({
      where: {
        usuario_id: usuarioId,
        tipo,
        usado: false,
      },
      data: {
        usado: true,
      },
    });

    const codigo = await this.prisma.codigoVerificacion.create({
      data: {
        usuario_id: usuarioId,
        codigo_hash,
        tipo,
        expira,
        intentos: 0,
        usado: false,
      },
    });

    return { otp, codigo };
  }

  /**
   * Valida y marca como usado el código OTP:
   * - Busca el código válido más reciente
   * - Verifica intentos (máximo 3)
   * - Verifica OTP con bcrypt
   * - Marca como usado si correcto, incrementa intentos si incorrecto
   */
  async validateAndUseCode(
    usuarioId: number,
    codigo: string,
    tipo: string,
  ): Promise<any> {
    // Busca el código válido más reciente no usado y no expirado
    const registro = await this.prisma.codigoVerificacion.findFirst({
      where: {
        usuario_id: usuarioId,
        tipo,
        usado: false,
        expira: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!registro) {
      throw new BadRequestException('No existe un código válido o ha expirado. Solicite uno nuevo.');
    }

    if (registro.intentos >= 3) {
      // Bloquea el código tras 3 intentos
      await this.prisma.codigoVerificacion.update({
        where: { id: registro.id },
        data: { usado: true },
      });
      throw new BadRequestException('Código bloqueado por exceso de intentos. Solicite uno nuevo.');
    }

    const esValido = await this.verifyOTP(codigo, registro.codigo_hash);

    if (esValido) {
      const actualizado = await this.prisma.codigoVerificacion.update({
        where: { id: registro.id },
        data: {
          usado: true,
          usado_at: new Date(),
        },
      });
      return actualizado;
    } else {
      await this.prisma.codigoVerificacion.update({
        where: { id: registro.id },
        data: {
          intentos: { increment: 1 },
        },
      });
      throw new UnauthorizedException('Código OTP incorrecto.');
    }
  }
}
