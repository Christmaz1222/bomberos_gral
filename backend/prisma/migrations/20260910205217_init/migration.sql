-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "ci" VARCHAR(20) NOT NULL,
    "nombre_completo" VARCHAR(200) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "tipo_persona" VARCHAR(20) NOT NULL,
    "departamento" VARCHAR(50),
    "provincia" VARCHAR(50),
    "municipio" VARCHAR(50),
    "area" VARCHAR(50),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "ultimo_acceso" TIMESTAMP(3),
    "role" VARCHAR(20) DEFAULT 'EXTERNO',
    "grado" VARCHAR(50),
    "unidad" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "nit" VARCHAR(20) NOT NULL,
    "razon_social" VARCHAR(200) NOT NULL,
    "tipo_empresa" VARCHAR(50),
    "departamento" VARCHAR(50),
    "provincia" VARCHAR(50),
    "municipio" VARCHAR(50),
    "direccion" TEXT,
    "telefono" VARCHAR(20),
    "email_institucional" VARCHAR(100),
    "representante_id" INTEGER,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_aprobacion" TIMESTAMP(3),
    "observacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodigoVerificacion" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "codigo_hash" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "expira" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "usado_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodigoVerificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modulo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submodulo" (
    "id" SERIAL NOT NULL,
    "modulo_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "tipo_persona" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submodulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "empresa_id" INTEGER,
    "submodulo_id" INTEGER NOT NULL,
    "tipo_persona" VARCHAR(20) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_envio" TIMESTAMP(3),
    "fecha_aprobacion" TIMESTAMP(3),
    "observacion" TEXT,
    "ubicacion" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificadoHabilitacion" (
    "id" SERIAL NOT NULL,
    "numero_registro" VARCHAR(50) NOT NULL,
    "usuario_id" INTEGER,
    "empresa_id" INTEGER,
    "tipo_persona" VARCHAR(20) NOT NULL,
    "codigo_qr" VARCHAR(255) NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'VIGENTE',
    "solicitud_id" INTEGER,
    "es_historico" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificadoHabilitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url_accion" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_ci_key" ON "Usuario"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_nit_key" ON "Empresa"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "Modulo_nombre_key" ON "Modulo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Submodulo_modulo_id_nombre_key" ON "Submodulo"("modulo_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_codigo_key" ON "Solicitud"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "CertificadoHabilitacion_numero_registro_key" ON "CertificadoHabilitacion"("numero_registro");

-- CreateIndex
CREATE UNIQUE INDEX "CertificadoHabilitacion_codigo_qr_key" ON "CertificadoHabilitacion"("codigo_qr");

-- CreateIndex
CREATE INDEX "Notificacion_usuario_id_leida_idx" ON "Notificacion"("usuario_id", "leida");

-- AddForeignKey
ALTER TABLE "CodigoVerificacion" ADD CONSTRAINT "CodigoVerificacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submodulo" ADD CONSTRAINT "Submodulo_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "Modulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_submodulo_id_fkey" FOREIGN KEY ("submodulo_id") REFERENCES "Submodulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
