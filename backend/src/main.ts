import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');
  
  // ValidationPipe global para validar DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // Elimina propiedades no permitidas
    forbidNonWhitelisted: true,   // Lanza error si hay propiedades extra
    transform: true,              // Transforma automáticamente los tipos
    disableErrorMessages: false,  // Muestra mensajes de error detallados
  }));
  
  // CORS configurado con variable de entorno
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📡 API prefix: /api`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();