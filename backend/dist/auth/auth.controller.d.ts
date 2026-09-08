import { AuthService } from './auth.service';
import { LoginDto, VerifyOtpDto, RegisterDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        correo: string;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        newPassword: string;
        nuevaPassword?: string;
    }): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        requiereOtp: boolean;
        email: string;
        userId: number;
        message: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
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
}
