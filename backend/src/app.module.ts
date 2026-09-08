import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmailModule,
    // Throttler para limitar peticiones (v6 usa array y ttl en ms)
    ThrottlerModule.forRoot([{
      ttl: 60000,      // 60 segundos
      limit: 10,       // 10 solicitudes por TTL
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Aplica rate limiting globalmente
    },
  ],
})
export class AppModule {}