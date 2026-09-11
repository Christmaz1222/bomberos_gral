-- CreateIndex
CREATE INDEX "CodigoVerificacion_usuario_id_idx" ON "CodigoVerificacion"("usuario_id");

-- CreateIndex
CREATE INDEX "CodigoVerificacion_usuario_id_tipo_usado_idx" ON "CodigoVerificacion"("usuario_id", "tipo", "usado");
