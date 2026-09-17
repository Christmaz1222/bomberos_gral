-- CreateTable
CREATE TABLE "inspecciones" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "inspector_id" INTEGER NOT NULL,
    "asignado_por" INTEGER,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_programada" TIMESTAMP(3),
    "fecha_realizada" TIMESTAMP(3),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ASIGNADA',
    "resultado" VARCHAR(20),
    "observaciones" TEXT,
    "checklist" JSONB,
    "documentos" JSONB,
    "firma_inspector" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspecciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspecciones_solicitud_id_idx" ON "inspecciones"("solicitud_id");

-- CreateIndex
CREATE INDEX "inspecciones_inspector_id_idx" ON "inspecciones"("inspector_id");

-- CreateIndex
CREATE INDEX "inspecciones_estado_idx" ON "inspecciones"("estado");

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "usuarios_internos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_asignado_por_fkey" FOREIGN KEY ("asignado_por") REFERENCES "usuarios_internos"("id") ON DELETE SET NULL ON UPDATE CASCADE;


