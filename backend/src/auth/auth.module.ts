import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module'; // 👈 Agregar

@Module({
  imports: [
    PassportModule,
    EmailModule,
    PrismaModule, // 👈 Agregar (necesario para PrismaService en AuthService)
    JwtModule.registerAsync({ // 👈 Cambiar a registerAsync
      useFactory: () => ({
        secret: process.env.JWT_SECRET, // 👈 SIN FALLBACK
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService],
  exports: [AuthService, JwtModule], // 👈 Agregar exports
})
export class AuthModule {}