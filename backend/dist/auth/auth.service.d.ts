import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
        message: string;
        requiereOtp: boolean;
        email: string;
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
