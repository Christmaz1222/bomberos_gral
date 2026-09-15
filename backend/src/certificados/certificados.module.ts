import { Module } from '@nestjs/common';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';
import { PdfService } from './pdf.service';
import { QrService } from './qr.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CertificadosController],
  providers: [CertificadosService, PdfService, QrService],
  exports: [CertificadosService],
})
export class CertificadosModule {}