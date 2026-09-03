import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: {
    ci: string;
    nombre_completo: string;
    email: string;
    telefono: string;
    password: string;
    tipo_persona: string;
  }) {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }
  //este codigo es para la opcion de olvido su contraseña?
  @Post('forgot-password')
async forgotPassword(@Body() body: { email: string }) {
  return this.authService.forgotPassword(body);
}

@Post('reset-password')
async resetPassword(@Body() body: { token: string; nuevaPassword: string }) {
  return this.authService.resetPassword(body);
}
//es hasta qui
}
