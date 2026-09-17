import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Req, UseGuards, Delete, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  LoginDto,
  VerifyOtpDto,
  RegisterDto,
  ResendOtpDto,
  KerverosExchangeDto,
  AgregarTramiteDto,
} from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================
  // ENDPOINTS EXISTENTES - MANTENER
  // ============================================

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo usuario ciudadano',
    description: 'Crea una cuenta con CI, email y contraseña. Envía credenciales por email.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        message: 'Registro exitoso. Se enviaron las credenciales a su correo.',
        correo: 'usuario@example.com',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos (validación DTO)' })
  async register(@Body() registerDto: RegisterDto) {
    console.log(`📝 New registration: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description: 'Genera un enlace de recuperación y lo envía al correo del usuario.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'usuario@example.com' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({ status: 200, description: 'Instrucciones de recuperación enviadas' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async forgotPassword(@Body() body: { email: string }) {
    console.log(`🔑 Forgot password: ${body.email}`);
    return this.authService.forgotPassword({ email: body.email });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña con token',
    description: 'Valida el token de recuperación y actualiza la contraseña.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        newPassword: { type: 'string', example: 'MiNuevaPassword123' },
        nuevaPassword: { type: 'string', example: 'MiNuevaPassword123' },
      },
      required: ['token', 'newPassword'],
    },
  })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
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
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Valida credenciales y envía OTP por email para verificación 2FA.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Credenciales válidas, OTP enviado',
    schema: {
      example: {
        requiereOtp: true,
        email: 'usuario@example.com',
        userId: 8,
        message: 'Código de verificación enviado a tu email',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o usuario inactivo' })
  @ApiResponse({ status: 429, description: 'Demasiadas peticiones (rate limit)' })
  async login(@Body() loginDto: LoginDto) {
    const email = loginDto.email || loginDto.correo;
    console.log(`📥 Login intent: ${email}`);
    return this.authService.login({ email, password: loginDto.password });
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar OTP y obtener JWT',
    description: 'Valida el código OTP recibido por email. Retorna JWT para acceder a endpoints protegidos.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'OTP válido, JWT generado',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 8, email: 'usuario@example.com', role: 'EXTERNO' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Código inválido, expirado o bloqueado' })
  @ApiResponse({ status: 401, description: 'Usuario no encontrado o código incorrecto' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    console.log(`✅ Verify OTP: ${verifyOtpDto.email}`);
    return this.authService.verifyOtp({
      email: verifyOtpDto.email,
      codigo: verifyOtpDto.codigo,
    });
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reenviar OTP',
    description: 'Genera y envía un nuevo código OTP al correo del usuario.',
  })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({ status: 200, description: 'Nuevo OTP enviado' })
  @ApiResponse({ status: 401, description: 'Usuario no encontrado o inactivo' })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    const email = resendOtpDto.email || resendOtpDto.correo;
    console.log(`🔄 Resend OTP: ${email}`);
    return this.authService.resendOtp({ email });
  }

  // ============================================
  // PERFIL DEL USUARIO AUTENTICADO
  // ============================================

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener datos base del usuario autenticado',
    description: 'Retorna CI, nombre, correo, teléfono, departamento y tipo de persona del usuario con sesión activa.',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del perfil',
    schema: {
      example: {
        id: 1,
        ci: '1234567',
        nombreCompleto: 'Juan Pérez Mamani',
        email: 'usuario@example.com',
        telefono: '71234567',
        departamento: 'La Paz',
        tipoPersona: 'NATURAL',
        tramitesSolicitados: ['Registro de Profesionales'],
        role: 'EXTERNO',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido o ausente' })
  async getPerfil(@Req() req: any) {
    const usuario = await this.authService.getPerfil(req.user?.id);
    return usuario;
  }

  // ============================================
  // KERVEROS ENDPOINTS
  // ============================================

  @Post('kerveros/exchange')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Intercambiar token Kerberos/Kerveros por JWT interno',
    description: 'Valida el token de Kerveros (SSO interno) y emite el JWT de la plataforma.',
  })
  @ApiBody({ type: KerverosExchangeDto })
  @ApiResponse({
    status: 200,
    description: 'JWT interno generado',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 5, email: 'interno@bomberos.gob.bo', role: 'INTERNO' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token inválido o faltan datos' })
  @ApiResponse({ status: 401, description: 'Token de Kerveros no válido' })
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
  @ApiOperation({
    summary: 'Callback de Kerberos/Kerveros SSO',
    description: 'Recibe el token de Kerveros por query. Auto-registra UsuarioInterno y retorna JWT interno.',
  })
  @ApiQuery({ name: 'token', required: true, description: 'JWT de Kerberos/Kerveros' })
  @ApiResponse({
    status: 200,
    description: 'Autenticación procesada (éxito o error)',
    schema: {
      example: {
        success: true,
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 5, email: 'interno@bomberos.gob.bo', rol: 'ADMIN', tipo: 'INTERNO' },
        redirectUrl: '/admin/dashboard',
      },
    },
  })
  async kerverosCallback(@Query('token') token: string) {
    if (!token) {
      return {
        success: false,
        message: 'Token de Kerveros no proporcionado',
        redirectUrl: '/admin/login?error=kerveros_token_missing',
      };
    }
    try {
      const result = await this.authService.kerverosCallback(token);
      return {
        success: true,
        access_token: result.access_token,
        user: result.user,
        redirectUrl: '/admin/dashboard',
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Error al procesar token de Kerveros',
        redirectUrl: '/admin/login?error=kerveros_invalid',
      };
    }
  }

  // ============================================
  // FASE 6 — GESTIÓN DE TRÁMITES DE LA SESIÓN
  // ============================================

  @Get('tramites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Listar trámites habilitados en la sesión del ciudadano',
    description: 'Retorna los trámites que el ciudadano tiene habilitados en su cuenta.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de trámites habilitados',
    schema: {
      example: {
        tramites_solicitados: ['Registro de Profesionales', 'Capacitación'],
        total: 2,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async obtenerTramites(@Req() req: any) {
    return this.authService.obtenerTramites(req.user?.id);
  }

  @Post('tramites/agregar')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Agregar un trámite a la sesión del ciudadano',
    description: 'Habilita un nuevo trámite para el ciudadano autenticado.',
  })
  @ApiBody({ type: AgregarTramiteDto })
  @ApiResponse({
    status: 201,
    description: 'Trámite agregado',
    schema: {
      example: {
        message: 'Trámite agregado correctamente',
        tramites_solicitados: ['Registro de Profesionales', 'Capacitacion'],
        total: 2,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Trámite duplicado o nombre vacío' })
  async agregarTramite(@Req() req: any, @Body() dto: AgregarTramiteDto) {
    return this.authService.agregarTramite(req.user?.id, dto);
  }

  @Delete('tramites/:nombre')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Quitar un trámite de la sesión del ciudadano',
    description: 'Deshabilita un trámite previamente agregado.',
  })
  @ApiParam({ name: 'nombre', description: 'Nombre del trámite a quitar', example: 'Capacitación' })
  @ApiResponse({
    status: 200,
    description: 'Trámite quitado',
    schema: {
      example: {
        message: 'Trámite quitado correctamente',
        tramites_solicitados: ['Registro de Profesionales'],
        total: 1,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'El trámite no está habilitado' })
  async quitarTramite(@Req() req: any, @Param('nombre') nombre: string) {
    return this.authService.quitarTramite(req.user?.id, nombre);
  }
}
