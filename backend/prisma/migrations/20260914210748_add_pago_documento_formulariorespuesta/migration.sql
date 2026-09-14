-- CreateTable
CREATE TABLE "FormularioRespuesta" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "datos_formulario" JSONB NOT NULL,
    "version" VARCHAR(20) NOT NULL DEFAULT '1.0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormularioRespuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoAdjunto" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "url_archivo" TEXT NOT NULL,
    "hash_archivo" VARCHAR(255),
    "subido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoAdjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "monto_ufv" DECIMAL(12,2),
    "monto_bs" DECIMAL(12,2),
    "codigo_orden" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "comprobante_url" TEXT,
    "verificado_por" INTEGER,
    "fecha_verificacion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormularioRespuesta_solicitud_id_idx" ON "FormularioRespuesta"("solicitud_id");

-- CreateIndex
CREATE INDEX "DocumentoAdjunto_solicitud_id_idx" ON "DocumentoAdjunto"("solicitud_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_codigo_orden_key" ON "Pago"("codigo_orden");

-- CreateIndex
CREATE INDEX "Pago_solicitud_id_idx" ON "Pago"("solicitud_id");

-- CreateIndex
CREATE INDEX "Pago_estado_idx" ON "Pago"("estado");

-- AddForeignKey
ALTER TABLE "CertificadoHabilitacion" ADD CONSTRAINT "CertificadoHabilitacion_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormularioRespuesta" ADD CONSTRAINT "FormularioRespuesta_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoAdjunto" ADD CONSTRAINT "DocumentoAdjunto_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_verificado_por_fkey" FOREIGN KEY ("verificado_por") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
