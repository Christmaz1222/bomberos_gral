# Prisma Studio — Guía de uso

Interfaz web para visualizar y editar datos de la base de datos PostgreSQL.

## ¿Cómo iniciarlo?

```bash
cd backend
npx prisma studio
```

Esto abrirá `http://localhost:5555` en tu navegador.

## ¿Qué puedo hacer?

### 1. Ver todas las tablas
En el panel izquierdo aparecen los 8 modelos:

- Usuario
- Empresa
- CodigoVerificacion
- Modulo
- Submodulo
- Solicitud
- CertificadoHabilitacion
- Notificacion

### 2. Ver registros
Haz clic en cualquier tabla para ver sus registros.

### 3. Filtrar
Usa el buscador para filtrar registros.

### 4. Editar
Haz clic en una celda para editar el valor (⚠️ cuidado en producción).

### 5. Crear registros
Botón **"Add record"** para agregar manualmente.

### 6. Eliminar
Seleccionar registro → **Delete**.

## Casos de uso

### Verificar usuarios registrados
1. Abrir Prisma Studio
2. Clic en **"Usuario"**
3. Ver todos los usuarios

### Ver códigos OTP generados
1. Clic en **"CodigoVerificacion"**
2. Ver los códigos (hasheados)
3. Ver cuáles están `usado = true`

### Debug de solicitudes
1. Clic en **"Solicitud"**
2. Ver estado, fecha, usuario

## ⚠️ Advertencias

- NO editar en producción sin backup
- NO eliminar registros sin confirmar
- Los datos se guardan inmediatamente (no hay botón "guardar")

## Puerto

- Por defecto: `5555`
- Cambiar: `npx prisma studio --port 5556`