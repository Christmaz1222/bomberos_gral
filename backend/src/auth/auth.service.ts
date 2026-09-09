import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { OtpService } from './otp.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
  ) {}

  // 1. Registro Inicial: Crea el usuario con una contraseña fija (o la que se le asigne)
  async register(data: {
    cedula?: string;
    ci?: string;
    nombreCompleto?: string;
    nombre_completo?: string;
    correo?: string;
    email?: string;
    celular?: string;
    telefono?: string;
    departamento?: string;
    representaEmpresa?: string;
    nit?: string;
    formularioARegistrar?: string;
    password?: string;
  }) {
    const ci = data.cedula || data.ci|| '';
    const nombre_completo = data.nombreCompleto || data.nombre_completo || 'Sin nombre';
    const email = data.correo || data.email || '';
    const telefono = String(data.celular || data.telefono || '');
    const departamento = data.departamento || '';
    const tipo_persona = data.representaEmpresa === 'si' ? 'EMPRESA' : 'NATURAL';

    if (!email || !ci) {
      throw new BadRequestException('El correo y la cédula son obligatorios');
    }

    let user = await this.prisma.usuario.findFirst({
      where: { OR: [{ email }, { ci }] }
    });

    // Contraseña fija por defecto si no se especifica otra
    const passwordPlana = data.password || 'Bomberos2026*';

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(passwordPlana, salt);

    if (!user) {
      user = await this.prisma.usuario.create({
        data: {
          ci,
          nombre_completo,
          email,
          telefono,
          departamento,
          tipo_persona,
          password_hash,
          verificado: true,
        },
      });
    } else {
      await this.prisma.usuario.update({
        where: { id: user.id },
        data: { password_hash }
      });
    }

    console.log(`\n========================================`);
    console.log(`[CREDENCIALES ENVIADAS A: ${email}]`);
    console.log(`Contraseña de acceso: ${passwordPlana}`);
    console.log(`========================================\n`);

    return {
      message: 'Registro exitoso. Se enviaron las credenciales a su correo.',
      correo: user.email,
    };
  }

  // 2. Inicio de sesión - genera OTP y envía por email
  async login(data: { email?: string; correo?: string; password: string }) {
    const email = data.email || data.correo;

    if (!email) {
      throw new UnauthorizedException('El correo electrónico es obligatorio');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.activo === false) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(data.password, usuario.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { otp, codigo } = await this.otpService.createVerificationCode(usuario.id, 'LOGIN_2FA');

    try {
      await this.emailService.sendOTP(email, otp);
    } catch (e) {
      console.warn(`⚠️ No se pudo enviar email a ${email}:`, (e as Error).message);
    }

    console.log(`🔐 OTP para ${email}: ${otp} (expira en 10 min)`);
    console.log(`📝 ID del código: ${codigo.id}`);

    return {
      requiereOtp: true,
      email: usuario.email,
      userId: usuario.id,
      message: 'Código de verificación enviado a tu email',
    };
  }

  // 2b. Reenvío OTP - genera nuevo código para el usuario
  async resendOtp(data: { email?: string; correo?: string }) {
    const email = data.email || data.correo;
    if (!email) {
      throw new BadRequestException('El correo electrónico es obligatorio');
    }
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (usuario.activo === false) {
      throw new UnauthorizedException('Usuario inactivo');
    }
    const { otp, codigo } = await this.otpService.createVerificationCode(usuario.id, 'LOGIN_2FA');
    try {
      await this.emailService.sendOTP(email, otp);
    } catch (e) {
      console.warn(`⚠️ No se pudo enviar email a ${email}:`, (e as Error).message);
    }
    console.log(`🔐 [RESEND] OTP para ${email}: ${otp} (expira en 10 min)`);
    console.log(`📝 ID del código: ${codigo.id}`);
    return {
      message: 'Nuevo código de verificación enviado a tu email',
      email: usuario.email,
    };
  }

  // 2b. Verificación OTP - valida código y emite JWT
  async verifyOtp(data: { email: string; codigo: string }) {
    const { email, codigo } = data;

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: { id: true, email: true, nombre_completo: true, ci: true, tipo_persona: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    await this.otpService.validateAndUseCode(usuario.id, codigo, 'LOGIN_2FA');

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimo_acceso: new Date() },
    });

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre_completo,
      ci: usuario.ci,
      tipo_persona: usuario.tipo_persona,
      role: 'EXTERNO',
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre_completo,
        ci: usuario.ci,
        tipo_persona: usuario.tipo_persona,
        role: 'EXTERNO',
      },
    };
  }
  // 3. Solicitar recuperación de contraseña ("Olvidé mi contraseña")
  async forgotPassword(data: { email: string }) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new BadRequestException('Si el correo está registrado, se han enviado las instrucciones.');
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' }
    );

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    console.log(`\n========================================`);
    console.log(`[RECUPERACIÓN DE CONTRASEÑA]`);
    console.log(`Enlace enviado a ${data.email}: ${resetLink}`);
    console.log(`========================================\n`);

    return {
      message: 'Se ha enviado un enlace de recuperación a su correo electrónico.',
    };
  }

  // 4. Restablecer la contraseña usando el token del correo
  async resetPassword(data: { token: string; nuevaPassword: string }) {
    try {
      const payload = this.jwtService.verify(data.token);
      const userId = payload.sub;

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(data.nuevaPassword, salt);

      await this.prisma.usuario.update({
        where: { id: userId },
        data: { password_hash },
      });

      return {
        message: 'Contraseña actualizada exitosamente. Ya puede iniciar sesión.',
      };
    } catch (error) {
      throw new BadRequestException('El enlace de recuperación ha expirado o es inválido.');
    }
  }
}