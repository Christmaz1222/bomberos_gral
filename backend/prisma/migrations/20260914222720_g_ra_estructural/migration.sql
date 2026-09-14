/*
  Warnings:

  - You are about to drop the `DocumentoAdjunto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentoAdjunto" DROP CONSTRAINT "DocumentoAdjunto_solicitud_id_fkey";

-- DropForeignKey
ALTER TABLE "Pago" DROP CONSTRAINT "Pago_verificado_por_fkey";

-- AlterTable
ALTER TABLE "FormularioRespuesta" ADD COLUMN     "hash_integridad" VARCHAR(128),
ADD COLUMN     "hash_pdf" VARCHAR(128),
ADD COLUMN     "submodulo_id" INTEGER;

-- DropTable
DROP TABLE "DocumentoAdjunto";

-- CreateTable
CREATE TABLE "documentos_solicitudes" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "nombre_original" VARCHAR(255) NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "tipo_documento" VARCHAR(30) NOT NULL,
    "checksum" VARCHAR(128),
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_internos" (
    "id" SERIAL NOT NULL,
    "external_id" VARCHAR(100),
    "nombre" VARCHAR(200) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" VARCHAR(50) NOT NULL,
    "permisos" JSONB,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_internos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "usuario_interno_id" INTEGER,
    "token_hash" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "fecha_expira" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_empresas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "relacion" VARCHAR(30) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_modulos" (
    "id" SERIAL NOT NULL,
    "submodulo_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "requiere_pago" BOOLEAN NOT NULL DEFAULT false,
    "monto_ufv" DECIMAL(10,2),
    "monto_bs" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_solicitudes" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "usuario_interno_id" INTEGER,
    "estado_anterior" VARCHAR(20),
    "estado_nuevo" VARCHAR(20) NOT NULL,
    "observacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documentos_solicitudes_solicitud_id_idx" ON "documentos_solicitudes"("solicitud_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_internos_external_id_key" ON "usuarios_internos"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_internos_email_key" ON "usuarios_internos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_token_hash_key" ON "sesiones"("token_hash");

-- CreateIndex
CREATE INDEX "sesiones_usuario_id_idx" ON "sesiones"("usuario_id");

-- CreateIndex
CREATE INDEX "sesiones_usuario_interno_id_idx" ON "sesiones"("usuario_interno_id");

-- CreateIndex
CREATE INDEX "sesiones_fecha_expira_idx" ON "sesiones"("fecha_expira");

-- CreateIndex
CREATE INDEX "usuarios_empresas_empresa_id_idx" ON "usuarios_empresas"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_empresas_usuario_id_empresa_id_key" ON "usuarios_empresas"("usuario_id", "empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_modulos_submodulo_id_key" ON "configuracion_modulos"("submodulo_id");

-- CreateIndex
CREATE INDEX "historial_solicitudes_solicitud_id_idx" ON "historial_solicitudes"("solicitud_id");

-- CreateIndex
CREATE INDEX "historial_solicitudes_created_at_idx" ON "historial_solicitudes"("created_at");

-- CreateIndex
CREATE INDEX "FormularioRespuesta_submodulo_id_idx" ON "FormularioRespuesta"("submodulo_id");

-- CreateIndex
CREATE INDEX "Pago_verificado_por_idx" ON "Pago"("verificado_por");

-- AddForeignKey
ALTER TABLE "FormularioRespuesta" ADD CONSTRAINT "FormularioRespuesta_submodulo_id_fkey" FOREIGN KEY ("submodulo_id") REFERENCES "Submodulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_solicitudes" ADD CONSTRAINT "documentos_solicitudes_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_verificado_por_fkey" FOREIGN KEY ("verificado_por") REFERENCES "usuarios_internos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_interno_id_fkey" FOREIGN KEY ("usuario_interno_id") REFERENCES "usuarios_internos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_empresas" ADD CONSTRAINT "usuarios_empresas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_empresas" ADD CONSTRAINT "usuarios_empresas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_modulos" ADD CONSTRAINT "configuracion_modulos_submodulo_id_fkey" FOREIGN KEY ("submodulo_id") REFERENCES "Submodulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_solicitudes" ADD CONSTRAINT "historial_solicitudes_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_solicitudes" ADD CONSTRAINT "historial_solicitudes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_solicitudes" ADD CONSTRAINT "historial_solicitudes_usuario_interno_id_fkey" FOREIGN KEY ("usuario_interno_id") REFERENCES "usuarios_internos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
