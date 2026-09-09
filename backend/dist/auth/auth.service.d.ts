import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';
import { EmailService } from '../email/email.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private otpService;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, otpService: OtpService, emailService: EmailService);
    exchangeKerverosToken(kerverosToken: string): Promise<{
        token: string;
        user: {
            id: number;
            email: string;
            nombre: string;
            ci: string;
            tipo_persona: string;
            role: string;
            grado: string | null;
            unidad: string | null;
        };
    }>;
    private validateKerverosToken;
    register(data: {
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
    }): Promise<{
        message: string;
        correo: string;
    }>;
    login(data: {
        email?: string;
        correo?: string;
        password: string;
    }): Promise<{
        requiereOtp: boolean;
        email: string;
        userId: number;
        message: string;
    }>;
    resendOtp(data: {
        email?: string;
        correo?: string;
    }): Promise<{
        message: string;
        email: string;
    }>;
    verifyOtp(data: {
        email: string;
        codigo: string;
    }): Promise<{
        token: string;
        user: {
            id: number;
            email: string;
            nombre: string;
            ci: string;
            tipo_persona: string;
            role: string;
        };
    }>;
    forgotPassword(data: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(data: {
        token: string;
        nuevaPassword: string;
    }): Promise<{
        message: string;
    }>;
}
