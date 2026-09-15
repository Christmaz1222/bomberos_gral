-- CreateTable
CREATE TABLE "auditoria_general" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "usuario_interno_id" INTEGER,
    "accion" VARCHAR(100) NOT NULL,
    "tabla_afectada" VARCHAR(50),
    "registro_id" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "detalle" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_general_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_cambios" (
    "id" SERIAL NOT NULL,
    "tabla" VARCHAR(50) NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "campo" VARCHAR(100) NOT NULL,
    "valor_anterior" TEXT,
    "valor_nuevo" TEXT,
    "usuario_id" INTEGER,
    "usuario_interno_id" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_cambios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_admin" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "url_accion" VARCHAR(255),
    "prioridad" VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametros_sistema" (
    "id" SERIAL NOT NULL,
    "clave" VARCHAR(50) NOT NULL,
    "valor" TEXT,
    "descripcion" TEXT,
    "categoria" VARCHAR(50),
    "editable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametros_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache_catalogos" (
    "id" SERIAL NOT NULL,
    "tabla_origen" VARCHAR(50) NOT NULL,
    "external_id" VARCHAR(100),
    "datos" JSONB NOT NULL,
    "fecha_sincronizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cache_catalogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intentos_login" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "ip_address" VARCHAR(45),
    "exitoso" BOOLEAN NOT NULL DEFAULT false,
    "user_agent" TEXT,
    "razon" VARCHAR(100),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intentos_login_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditoria_general_usuario_id_idx" ON "auditoria_general"("usuario_id");

-- CreateIndex
CREATE INDEX "auditoria_general_usuario_interno_id_idx" ON "auditoria_general"("usuario_interno_id");

-- CreateIndex
CREATE INDEX "auditoria_general_accion_idx" ON "auditoria_general"("accion");

-- CreateIndex
CREATE INDEX "auditoria_general_tabla_afectada_registro_id_idx" ON "auditoria_general"("tabla_afectada", "registro_id");

-- CreateIndex
CREATE INDEX "auditoria_general_fecha_idx" ON "auditoria_general"("fecha");

-- CreateIndex
CREATE INDEX "auditoria_cambios_tabla_registro_id_idx" ON "auditoria_cambios"("tabla", "registro_id");

-- CreateIndex
CREATE INDEX "auditoria_cambios_campo_idx" ON "auditoria_cambios"("campo");

-- CreateIndex
CREATE INDEX "auditoria_cambios_fecha_idx" ON "auditoria_cambios"("fecha");

-- CreateIndex
CREATE INDEX "alertas_admin_admin_id_leida_idx" ON "alertas_admin"("admin_id", "leida");

-- CreateIndex
CREATE INDEX "alertas_admin_prioridad_idx" ON "alertas_admin"("prioridad");

-- CreateIndex
CREATE INDEX "alertas_admin_created_at_idx" ON "alertas_admin"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "parametros_sistema_clave_key" ON "parametros_sistema"("clave");

-- CreateIndex
CREATE INDEX "parametros_sistema_categoria_idx" ON "parametros_sistema"("categoria");

-- CreateIndex
CREATE INDEX "cache_catalogos_tabla_origen_idx" ON "cache_catalogos"("tabla_origen");

-- CreateIndex
CREATE INDEX "cache_catalogos_fecha_expiracion_idx" ON "cache_catalogos"("fecha_expiracion");

-- CreateIndex
CREATE UNIQUE INDEX "cache_catalogos_tabla_origen_external_id_key" ON "cache_catalogos"("tabla_origen", "external_id");

-- CreateIndex
CREATE INDEX "intentos_login_email_fecha_idx" ON "intentos_login"("email", "fecha");

-- CreateIndex
CREATE INDEX "intentos_login_ip_address_fecha_idx" ON "intentos_login"("ip_address", "fecha");

-- CreateIndex
CREATE INDEX "intentos_login_exitoso_idx" ON "intentos_login"("exitoso");

-- AddForeignKey
ALTER TABLE "auditoria_general" ADD CONSTRAINT "auditoria_general_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_general" ADD CONSTRAINT "auditoria_general_usuario_interno_id_fkey" FOREIGN KEY ("usuario_interno_id") REFERENCES "usuarios_internos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_cambios" ADD CONSTRAINT "auditoria_cambios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_cambios" ADD CONSTRAINT "auditoria_cambios_usuario_interno_id_fkey" FOREIGN KEY ("usuario_interno_id") REFERENCES "usuarios_internos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_admin" ADD CONSTRAINT "alertas_admin_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "usuarios_internos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
