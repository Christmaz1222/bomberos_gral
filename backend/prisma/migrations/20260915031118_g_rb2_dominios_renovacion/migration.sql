/*
  Warnings:

  - You are about to drop the column `es_historico` on the `CertificadoHabilitacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CertificadoHabilitacion" DROP COLUMN "es_historico",
ADD COLUMN     "certificado_anterior_id" INTEGER;

-- CreateTable
CREATE TABLE "sippci_datos" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "tipo_persona" VARCHAR(20) NOT NULL,
    "datos_especificos" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sippci_datos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reglamentacion_datos" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "tipo_reglamento" VARCHAR(50) NOT NULL,
    "datos_especificos" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reglamentacion_datos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turismo_datos" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "tipo_actividad" VARCHAR(50) NOT NULL,
    "datos_especificos" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turismo_datos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacitacion_datos" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "tipo_capacitacion" VARCHAR(50) NOT NULL,
    "datos_especificos" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capacitacion_datos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_renovacion" (
    "id" SERIAL NOT NULL,
    "certificado_id" INTEGER NOT NULL,
    "solicitante_id" INTEGER NOT NULL,
    "empresa_id" INTEGER,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentos_adjuntos" JSONB,
    "comprobante_pago" VARCHAR(255),
    "monto_pago" DECIMAL(10,2),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "nuevo_certificado_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_renovacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sippci_datos_solicitud_id_key" ON "sippci_datos"("solicitud_id");

-- CreateIndex
CREATE UNIQUE INDEX "reglamentacion_datos_solicitud_id_key" ON "reglamentacion_datos"("solicitud_id");

-- CreateIndex
CREATE UNIQUE INDEX "turismo_datos_solicitud_id_key" ON "turismo_datos"("solicitud_id");

-- CreateIndex
CREATE UNIQUE INDEX "capacitacion_datos_solicitud_id_key" ON "capacitacion_datos"("solicitud_id");

-- CreateIndex
CREATE INDEX "solicitudes_renovacion_certificado_id_idx" ON "solicitudes_renovacion"("certificado_id");

-- CreateIndex
CREATE INDEX "solicitudes_renovacion_solicitante_id_idx" ON "solicitudes_renovacion"("solicitante_id");

-- CreateIndex
CREATE INDEX "solicitudes_renovacion_estado_idx" ON "solicitudes_renovacion"("estado");

-- AddForeignKey
ALTER TABLE "CertificadoHabilitacion" ADD CONSTRAINT "CertificadoHabilitacion_certificado_anterior_id_fkey" FOREIGN KEY ("certificado_anterior_id") REFERENCES "CertificadoHabilitacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sippci_datos" ADD CONSTRAINT "sippci_datos_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reglamentacion_datos" ADD CONSTRAINT "reglamentacion_datos_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turismo_datos" ADD CONSTRAINT "turismo_datos_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacitacion_datos" ADD CONSTRAINT "capacitacion_datos_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_renovacion" ADD CONSTRAINT "solicitudes_renovacion_certificado_id_fkey" FOREIGN KEY ("certificado_id") REFERENCES "CertificadoHabilitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_renovacion" ADD CONSTRAINT "solicitudes_renovacion_nuevo_certificado_id_fkey" FOREIGN KEY ("nuevo_certificado_id") REFERENCES "CertificadoHabilitacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_renovacion" ADD CONSTRAINT "solicitudes_renovacion_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_renovacion" ADD CONSTRAINT "solicitudes_renovacion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
