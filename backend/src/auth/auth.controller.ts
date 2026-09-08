import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, VerifyOtpDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================
  // ENDPOINTS EXISTENTES - MANTENER
  // ============================================

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    console.log(`📝 New registration: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    console.log(`🔑 Forgot password: ${body.email}`);
    return this.authService.forgotPassword({ email: body.email });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string; newPassword: string; nuevaPassword?: string }) {
    console.log(`🔄 Reset password`);
    // Soporte para newPassword (frontend) y nuevaPassword (service)
    const nuevaPassword = body.nuevaPassword || body.newPassword;
    return this.authService.resetPassword({ token: body.token, nuevaPassword });
  }

  // ============================================
  // NUEVOS ENDPOINTS - AGREGAR
  // ============================================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const email = loginDto.email || loginDto.correo;
    console.log(`📥 Login intent: ${email}`);
    return this.authService.login({ email, password: loginDto.password });
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    console.log(`✅ Verify OTP: ${verifyOtpDto.email}`);
    return this.authService.verifyOtp({
      email: verifyOtpDto.email,
      codigo: verifyOtpDto.codigo,
    });
  }
}
