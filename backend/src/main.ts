import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Usar pino como logger global
  app.useLogger(app.get(Logger));
  
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

  // Swagger: documentación interactiva de APIs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SIPPCI DNB API')
    .setDescription(
      'API de la Plataforma Integral de Gestión de Trámites de la Dirección Nacional de Bomberos',
    )
    .setVersion('2.1.0')
    .setContact(
      'DNB - Área de Sistemas',
      'https://www.bomberos.gob.bo',
      'sistemas@bomberos.gob.bo',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingrese el JWT obtenido en /api/auth/login + verify-otp',
        in: 'header',
      },
      'access-token',
    )
    .addTag('auth', 'Autenticación de usuarios')
    .addTag('usuarios', 'Gestión de usuarios')
    .addTag('solicitudes', 'Gestión de trámites')
    .addTag('catalogos', 'Catálogos del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'SIPPCI DNB — API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📡 API prefix: /api`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();