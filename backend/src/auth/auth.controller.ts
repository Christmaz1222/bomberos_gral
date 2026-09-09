import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, VerifyOtpDto, RegisterDto, ResendOtpDto, KerverosExchangeDto } from './dto';

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

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    const email = resendOtpDto.email || resendOtpDto.correo;
    console.log(`🔄 Resend OTP: ${email}`);
    return this.authService.resendOtp({ email });
  }

  // ============================================
  // KERVEROS ENDPOINTS
  // ============================================

  @Post('kerveros/exchange')
  @HttpCode(HttpStatus.OK)
  async exchangeKerverosToken(@Body() dto: KerverosExchangeDto) {
    console.log(`🔐 Kerveros exchange attempt`);
    try {
      return await this.authService.exchangeKerverosToken(dto.token);
    } catch (error) {
      console.error(`❌ Kerveros exchange failed:`, (error as Error).message);
      throw error;
    }
  }

  @Get('kerveros/callback')
  async kerverosCallback(@Query('token') token: string) {
    console.log(`🔐 Kerveros callback received`);
    if (!token) {
      return {
        success: false,
        message: 'Token de Kerveros no proporcionado',
        redirectUrl: '/login?error=kerveros_token_missing',
      };
    }
    try {
      const result = await this.authService.exchangeKerverosToken(token);
      // Devolver datos formateados para frontend con redirect
      return {
        success: true,
        token: result.token,
        user: result.user,
        redirectUrl: '/admin/dashboard',
      };
    } catch (error) {
      console.error(`❌ Kerveros callback failed:`, (error as Error).message);
      return {
        success: false,
        message: (error as Error).message || 'Error al procesar token de Kerveros',
        redirectUrl: '/login?error=kerveros_invalid',
      };
    }
  }
}
