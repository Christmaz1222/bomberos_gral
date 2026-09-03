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
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
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
        const userEmail = data.email || data.correo;
        if (!userEmail) {
            throw new common_1.UnauthorizedException('El correo electrónico es obligatorio');
        }
        const user = await this.prisma.usuario.findUnique({
            where: { email: userEmail },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Contraseña incorrecta');
        }
        const codigoOTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[CÓDIGO OTP 2FA PARA ${userEmail}]: ${codigoOTP}`);
        return {
            message: 'Contraseña validada. Ingrese el código OTP enviado a su correo.',
            requiereOtp: true,
            email: user.email
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
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map