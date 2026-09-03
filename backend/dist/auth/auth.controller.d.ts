import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        ci: string;
        nombre_completo: string;
        email: string;
        telefono: string;
        password: string;
        tipo_persona: string;
    }): Promise<{
        message: string;
        correo: string;
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        message: string;
        requiereOtp: boolean;
        email: string;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        nuevaPassword: string;
    }): Promise<{
        message: string;
    }>;
}
