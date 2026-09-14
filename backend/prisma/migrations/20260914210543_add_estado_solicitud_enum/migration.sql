/*
  Warnings:

  - The `estado` column on the `Solicitud` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('BORRADOR', 'PENDIENTE_PAGO', 'COMPROBANTE_SUBIDO', 'EN_VERIFICACION', 'OBSERVADO', 'APROBADO', 'CERTIFICADO_EMITIDO', 'ANULADO');

-- AlterTable
ALTER TABLE "Solicitud" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoSolicitud" NOT NULL DEFAULT 'BORRADOR';
