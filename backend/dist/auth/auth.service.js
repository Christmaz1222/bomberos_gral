"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const otp_service_1 = require("./otp.service");
const email_service_1 = require("../email/email.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    otpService;
    emailService;
    constructor(prisma, jwtService, otpService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.emailService = emailService;
    }
    async exchangeKerverosToken(kerverosToken) {
        const kerverosPayload = await this.validateKerverosToken(kerverosToken);
        const { ci, nombre, grado, unidad, email } = kerverosPayload;
        if (!ci || !email) {
            throw new common_1.BadRequestException('Token de Kerveros inválido: faltan datos obligatorios (ci, email)');
        }
        let usuario = await this.prisma.usuario.findFirst({
            where: { OR: [{ ci }, { email }] },
        });
        const datosActualizados = {
            nombre_completo: nombre,
            email,
            ci,
            grado: grado || null,
            unidad: unidad || null,
            tipo_persona: 'INTERNO',
            verificado: true,
            activo: true,
            ultimo_acceso: new Date(),
        };
        if (!usuario) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(`Kerveros_${Date.now()}_${Math.random().toString(36).slice(2)}`, salt);
            usuario = await this.prisma.usuario.create({
                data: {
                    ...datosActualizados,
                    password_hash,
                    telefono: '',
                    departamento: unidad || '',
                },
            });
            console.log(`✅ Usuario INTERNO creado desde Kerveros: ${email} (CI: ${ci})`);
        }
        else {
            await this.prisma.usuario.update({
                where: { id: usuario.id },
                data: datosActualizados,
            });
            console.log(`🔄 Usuario INTERNO actualizado desde Kerveros: ${email} (CI: ${ci})`);
        }
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre_completo,
            ci: usuario.ci,
            tipo_persona: usuario.tipo_persona,
            role: 'INTERNO',
            grado: usuario.grado,
            unidad: usuario.unidad,
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
                role: 'INTERNO',
                grado: usuario.grado,
                unidad: usuario.unidad,
            },
        };
    }
    async validateKerverosToken(token) {
        try {
            const payload = this.jwtService.decode(token);
            if (!payload) {
                throw new common_1.UnauthorizedException('Token de Kerveros inválido o malformado');
            }
            if (payload['exp'] && Date.now() >= payload['exp'] * 1000) {
                throw new common_1.UnauthorizedException('Token de Kerveros expirado');
            }
            console.log(`🔍 Kerveros payload decodificado:`, {
                ci: payload.ci,
                nombre: payload.nombre,
                email: payload.email,
                grado: payload.grado,
                unidad: payload.unidad,
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
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            throw new common_1.UnauthorizedException('Error al validar token de Kerveros');
        }
    }
    async register(data) {
        const ci = data.cedula || data.ci || '';
        const nombre_completo = data.nombreCompleto || data.nombre_completo || 'Sin nombre';
        const email = data.correo || data.email || '';
        const telefono = String(data.celular || data.telefono || '');
        const departamento = data.departamento || '';
        const tipo_persona = data.representaEmpresa === 'si' ? 'EMPRESA' : 'NATURAL';
        if (!email || !ci) {
            throw new common_1.BadRequestException('El correo y la cédula son obligatorios');
        }
        let user = await this.prisma.usuario.findFirst({
            where: { OR: [{ email }, { ci }] }
        });
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
        }
        else {
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
    async login(data) {
        const email = data.email || data.correo;
        if (!email) {
            throw new common_1.UnauthorizedException('El correo electrónico es obligatorio');
        }
        const usuario = await this.prisma.usuario.findUnique({
            where: { email },
        });
        if (!usuario) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (usuario.activo === false) {
            throw new common_1.UnauthorizedException('Usuario inactivo');
        }
        const isPasswordValid = await bcrypt.compare(data.password, usuario.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const { otp, codigo } = await this.otpService.createVerificationCode(usuario.id, 'LOGIN_2FA');
        try {
            await this.emailService.sendOTP(email, otp);
        }
        catch (e) {
            console.warn(`⚠️ No se pudo enviar email a ${email}:`, e.message);
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
    async resendOtp(data) {
        const email = data.email || data.correo;
        if (!email) {
            throw new common_1.BadRequestException('El correo electrónico es obligatorio');
        }
        const usuario = await this.prisma.usuario.findUnique({
            where: { email },
        });
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        if (usuario.activo === false) {
            throw new common_1.UnauthorizedException('Usuario inactivo');
        }
        const { otp, codigo } = await this.otpService.createVerificationCode(usuario.id, 'LOGIN_2FA');
        try {
            await this.emailService.sendOTP(email, otp);
        }
        catch (e) {
            console.warn(`⚠️ No se pudo enviar email a ${email}:`, e.message);
        }
        console.log(`🔐 [RESEND] OTP para ${email}: ${otp} (expira en 10 min)`);
        console.log(`📝 ID del código: ${codigo.id}`);
        return {
            message: 'Nuevo código de verificación enviado a tu email',
            email: usuario.email,
        };
    }
    async verifyOtp(data) {
        const { email, codigo } = data;
        const usuario = await this.prisma.usuario.findUnique({
            where: { email },
            select: { id: true, email: true, nombre_completo: true, ci: true, tipo_persona: true },
        });
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
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
    async forgotPassword(data) {
        const user = await this.prisma.usuario.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new common_1.BadRequestException('Si el correo está registrado, se han enviado las instrucciones.');
        }
        const resetToken = this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn: '15m' });
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
        console.log(`\n========================================`);
        console.log(`[RECUPERACIÓN DE CONTRASEÑA]`);
        console.log(`Enlace enviado a ${data.email}: ${resetLink}`);
        console.log(`========================================\n`);
        return {
            message: 'Se ha enviado un enlace de recuperación a su correo electrónico.',
        };
    }
    async resetPassword(data) {
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
        }
        catch (error) {
            throw new common_1.BadRequestException('El enlace de recuperación ha expirado o es inválido.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        otp_service_1.OtpService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map