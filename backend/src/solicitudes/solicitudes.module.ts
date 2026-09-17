import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SolicitudesController } from './solicitudes.controller';
import { PagoWebhookController } from './pago-webhook.controller';
import { SolicitudesService } from './solicitudes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ComprobanteModule } from '../comprobantes/comprobante.module';

@Module({
  imports: [
    PrismaModule,
    ComprobanteModule,
    MulterModule.register({
      storage: undefined,
    }),
  ],
  controllers: [SolicitudesController, PagoWebhookController],
  providers: [SolicitudesService],
  exports: [SolicitudesService],
})
export class SolicitudesModule {}