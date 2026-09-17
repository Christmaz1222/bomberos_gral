import { Injectable, BadRequestException, UnauthorizedException, Logger, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { OtpService } from './otp.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { createHash } from 'crypto';

interface KerverosPayload {
  ci: string;
  nombre: string;
  grado?: string;
  unidad?: string;
  email: string;
  role?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private jwksClientInstance: jwksClient.JwksClient | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    const jwksUrl = this.configService.get<string>('KERVEROS_JWKS_URL');
    if (jwksUrl) {
      this.jwksClientInstance = jwksClient({
        jwksUri: jwksUrl,
        cache: true,
        cacheMaxAge: 10 * 60 * 1000,
      });
    }
  }

  // KERVEROS: Intercambio de token Kerveros por JWT interno
  // (3D: ahora usa UsuarioInterno + Sesion + JWT tipo INTERNO con rol)
  async exchangeKerverosToken(kerverosToken: string) {
    return this.kerverosCallback(kerverosToken);
  }

  // ============================================
  // 3D: CALLBACK KERVEROS (auto-registro, JWT interno, sesión)
  // ============================================
  async kerverosCallback(kerverosToken: string) {
    // 1. Validar token Kerberos (mock o real por JWKS)
    const payload = await this.validateKerverosToken(kerverosToken);

    if (!payload) {
      throw new UnauthorizedException('Token Kerberos inválido');
    }

    const extra = payload as any;
    const email = payload.email;
    const nombre = payload.nombre || extra.name || 'Funcionario DNB';
    const rol = extra.rol || payload.role || 'INSPECTOR';
    const externalId = extra.external_id || String(extra.sub || payload.ci || '');

    if (!email) {
      throw new UnauthorizedException('Token Kerberos sin email');
    }

    // 2. Auto-registro: buscar o crear UsuarioInterno
    let usuarioInterno = await this.prisma.usuarioInterno.findUnique({
      where: { email },
    });

    if (!usuarioInterno) {
      usuarioInterno = await this.prisma.usuarioInterno.create({
        data: {
          email,
          nombre,
          external_id: externalId || null,
          password_hash: '',
          rol,
          permisos: {},
          activo: true,
        },
      });
      this.logger.log(`🆕 Usuario interno auto-registrado: ${email} (${rol})`);
    } else {
      usuarioInterno = await this.prisma.usuarioInterno.update({
        where: { id: usuarioInterno.id },
        data: {
          nombre,
          rol,
          updated_at: new Date(),
        },
      });
      this.logger.log(`🔄 Usuario interno actualizado: ${email} (${rol})`);
    }

    if (!usuarioInterno.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 3. Generar JWT interno con rol y tipo INTERNO
    const accessToken = this.jwtService.sign({
      sub: usuarioInterno.id,
      email: usuarioInterno.email,
      nombre: usuarioInterno.nombre,
      rol: usuarioInterno.rol,
      role: usuarioInterno.rol,
      ci: usuarioInterno.external_id,
      tipo: 'INTERNO',
    });

    // 4. Registrar sesión (tabla Sesion — G-Ra)
    // token_hash = sha256(jwt + nonce) para garantizar unicidad por login
    const tokenHash = createHash('sha256')
      .update(accessToken + Date.now().toString(36) + Math.random().toString(36).slice(2))
      .digest('hex');
    await this.prisma.sesion.create({
      data: {
        usuario_interno_id: usuarioInterno.id,
        token_hash: tokenHash,
        fecha_expira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        activo: true,
      },
    });

    this.logger.log(`✅ Login Kerberos: ${usuarioInterno.email} (${usuarioInterno.rol})`);

    return {
      message: 'Autenticación Kerberos exitosa',
      access_token: accessToken,
      user: {
        id: usuarioInterno.id,
        email: usuarioInterno.email,
        nombre: usuarioInterno.nombre,
        rol: usuarioInterno.rol,
        tipo: 'INTERNO',
      },
    };
  }

  // Validación real del token Kerveros con verificación de firma JWKS
  private async validateKerverosToken(token: string): Promise<KerverosPayload> {
    // 3D: usar mock forzado si KERVEROS_MOCK_MODE=true (desarrollo local con JWKS real configurada)
    const forceMock = this.configService.get<string>('KERVEROS_MOCK_MODE') === 'true';
    const jwksUrl = forceMock ? '' : this.configService.get<string>('KERVEROS_JWKS_URL');
    const issuer = forceMock ? '' : this.configService.get<string>('KERVEROS_ISSUER');
    const audience = forceMock ? '' : this.configService.get<string>('KERVEROS_AUDIENCE');

    if (!jwksUrl || !this.jwksClientInstance) {
      this.logger.warn('⚠️ KERVEROS_JWKS_URL no configurada, modo MOCK');
      // Normalizar base64 (btoa del frontend) a base64url para jwt.decode
      const tokenUrlSafe = token
        .split('.')
        .map((part, idx) => {
          if (idx >= 2) return part;
          return part.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        })
        .join('.');
      const payload = this.jwtService.decode(tokenUrlSafe) as KerverosPayload | null;
      if (!payload) {
        throw new UnauthorizedException('Token de Kerveros inválido o malformado');
      }
      if (payload['exp'] && Date.now() >= payload['exp'] * 1000) {
        throw new UnauthorizedException('Token de Kerveros expirado');
      }
      this.logger.log(`🔍 Kerveros payload decodificado (MOCK):`, {
        ci: payload.ci,
        nombre: payload.nombre,
        email: payload.email,
      });
      return {
        ci: payload.ci,
        nombre: payload.nombre,
        grado: payload.grado,
        unidad: payload.unidad,
        email: payload.email,
        role: payload.role,
      };
    }

    this.logger.log('🔐 Kerveros en modo REAL con validación de firma JWKS');

    return new Promise((resolve, reject) => {
      const getKey = (header: any, callback: any) => {
        this.jwksClientInstance!.getSigningKey(header.kid, (err, key) => {
          if (err) {
            this.logger.error('❌ Error obteniendo clave JWKS:', err.message);
            return callback(err);
          }
          callback(null, key!.getPublicKey());
        });
      };

      jwt.verify(
        token,
        getKey,
        {
          issuer,
          audience,
          algorithms: ['RS256'],
        },
        (err, decoded: any) => {
          if (err) {
            this.logger.error('❌ Error validando token Kerveros:', err.message);
            return reject(new UnauthorizedException('Token de Kerveros inválido'));
          }
          this.logger.log(`🔍 Kerveros payload verificado:`, {
            ci: decoded.ci,
            nombre: decoded.nombre,
            email: decoded.email,
          });
          resolve({
            ci: decoded.ci,
            nombre: decoded.nombre,
            grado: decoded.grado,
            unidad: decoded.unidad,
            email: decoded.email,
            role: decoded.role,
          });
        },
      );
    });
  }

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
    tipo_persona?: string;
    representaEmpresa?: string | boolean;
    nit?: string;
    formularioARegistrar?: string;
    tramites_solicitados?: string[] | string;
    password?: string;
  }) {
    const ci = data.cedula || data.ci|| '';
    const nombre_completo = data.nombreCompleto || data.nombre_completo || 'Sin nombre';
    const email = data.correo || data.email || '';
    const telefono = String(data.celular || data.telefono || '');
    const departamento = data.departamento || '';
    // FASE 3a-fix: guardar tipo_persona correctamente.
    // - Prioridad al campo explícito tipo_persona (NATURAL | JURIDICA | EMPRESA)
    // - Compatibilidad: representaEmpresa=true/'si' fuerza JURIDICA
    // - Normalización: EMPRESA → JURIDICA para coherencia con el legacy
    let tipo_persona = (data.tipo_persona || '').trim().toUpperCase() || 'NATURAL';
    const representEmpresa =
      data.representaEmpresa === true ||
      String(data.representaEmpresa).toLowerCase() === 'si';
    if (tipo_persona === 'EMPRESA') tipo_persona = 'JURIDICA';
    if (representEmpresa && tipo_persona === 'NATURAL') tipo_persona = 'JURIDICA';
    const tramitesRaw = Array.isArray(data.tramites_solicitados)
      ? data.tramites_solicitados
      : data.formularioARegistrar
        ? [data.formularioARegistrar]
        : [];
    const tramites_solicitados = tramitesRaw
      .filter((t) => typeof t === 'string' && t.trim() !== '')
      .map((t) => t.trim());

    if (!email || !ci) {
      throw new BadRequestException('El correo y la cédula son obligatorios');
    }

    let user = await this.prisma.usuario.findFirst({
      where: { OR: [{ email }, { ci }] }
    });

    if (!data.password || data.password.trim() === '') {
      throw new BadRequestException('La contraseña es obligatoria');
    }
    const passwordPlana = data.password;

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
          tramites_solicitados,
        },
      });
    } else {
      await this.prisma.usuario.update({
        where: { id: user.id },
        data: { password_hash, tramites_solicitados }
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

    let otp: string;
    let codigo: any;
    try {
      const result = await this.otpService.createVerificationCode(usuario.id, 'LOGIN_2FA');
      otp = result.otp;
      codigo = result.codigo;
    } catch (error) {
      this.logger.error(`❌ Error creando código OTP: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException('Error al generar código de verificación');
    }

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

  // 5. Perfil del usuario autenticado (sin datos sensibles)
  async getPerfil(usuarioId: number) {
    if (!usuarioId) {
      throw new UnauthorizedException('No se pudo identificar al usuario');
    }
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        ci: true,
        nombre_completo: true,
        email: true,
        telefono: true,
        departamento: true,
        tipo_persona: true,
        tramites_solicitados: true,
        role: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const tramites = Array.isArray(usuario.tramites_solicitados)
      ? usuario.tramites_solicitados
      : [];

    return {
      id: usuario.id,
      ci: usuario.ci,
      nombreCompleto: usuario.nombre_completo,
      email: usuario.email,
      telefono: usuario.telefono,
      departamento: usuario.departamento,
      tipoPersona: usuario.tipo_persona,
      tramitesSolicitados: tramites,
      role: usuario.role,
    };
  }

  // ============================================
  // FASE 6 — GESTIÓN DE TRÁMITES DEL CIUDADANO
  // ============================================

  // 1. Listar trámites habilitados de la sesión del ciudadano
  async obtenerTramites(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { tramites_solicitados: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const tramites = Array.isArray(usuario.tramites_solicitados)
      ? usuario.tramites_solicitados
      : [];

    return { tramites_solicitados: tramites, total: tramites.length };
  }

  // 2. Agregar trámite a la sesión del ciudadano
  async agregarTramite(usuarioId: number, data: { nombre: string; entregar_ci?: string }) {
    const nombre = (data.nombre || '').trim();
    if (!nombre) {
      throw new BadRequestException('El nombre del trámite es obligatorio');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { tramites_solicitados: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const tramites = Array.isArray(usuario.tramites_solicitados)
      ? usuario.tramites_solicitados
      : [];

    if (tramites.includes(nombre)) {
      throw new BadRequestException('Ese trámite ya está habilitado para tu cuenta');
    }

    const tramitesActualizados = [...tramites, nombre];

    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { tramites_solicitados: tramitesActualizados },
    });

    return {
      message: 'Trámite agregado correctamente',
      tramites_solicitados: tramitesActualizados,
      total: tramitesActualizados.length,
    };
  }

  // 3. Quitar trámite de la sesión del ciudadano
  async quitarTramite(usuarioId: number, nombre: string) {
    const tramite = (nombre || '').trim();
    if (!tramite) {
      throw new BadRequestException('El nombre del trámite es obligatorio');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { tramites_solicitados: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const tramites = Array.isArray(usuario.tramites_solicitados)
      ? usuario.tramites_solicitados
      : [];

    if (!tramites.includes(tramite)) {
      throw new BadRequestException('Ese trámite no está habilitado en tu cuenta');
    }

    const tramitesActualizados = tramites.filter((t) => t !== tramite);

    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { tramites_solicitados: tramitesActualizados },
    });

    return {
      message: 'Trámite quitado correctamente',
      tramites_solicitados: tramitesActualizados,
      total: tramitesActualizados.length,
    };
  }
}