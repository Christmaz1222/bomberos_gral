import { Module } from '@nestjs/common';
import { ComprobanteService } from './comprobante.service';
import { PdfService } from '../certificados/pdf.service';
import { QrService } from '../certificados/qr.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ComprobanteService, PdfService, QrService],
  exports: [ComprobanteService],
})
export class ComprobanteModule {}
