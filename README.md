# Bomberos - Sistema SIPPCI (bomberos_gral)

Sistema en desarrollo por fases. Fase 1: Autoverificación usuario externo e interno (Bomberos / Policía Boliviana).

## Estructura
- `backend/` - NestJS + Prisma + PostgreSQL + JWT + OTP (bcrypt) + Throttler
- `bomberos-frontend/` - Vue 3 + Vite + Tailwind + Vue Router

## Usuarios
- **Externo**: registro inicial -> login -> popup OTP 6 dígitos -> `POST /auth/verify-otp` -> JWT -> `/admin/formularios`
- **Interno**: vía `https://kerveros-dev.policia.bo/` -> callback -> dashboard admin (pendiente Fase 2)

---

## Fase 1 - OTP y Login Real (feat: conectar OTP y login real para usuario externo)

### Cambios realizados
**Frontend `bomberos-frontend/src/services/auth.service.js`:**
- `register()` mapea `cedula→ci`, `correo→email`, `celular→telefono`, `nombreCompleto→nombre_completo`, `representaEmpresa si/no → tipo_persona EMPRESA/NATURAL`, envía `password` por defecto y usa `apiClient.post(/auth/register)`.
- `login()` maneja `{requiereOtp:true}` sin guardar token, normaliza `email/correo`.
- `verifyOtp({email,codigo})` real `POST /auth/verify-otp` guarda `token` + `user` + `userRole`.
- `resendOtp()/reenviarCodigo()` real `POST /auth/resend-otp`.
- `isAuthenticated()` valida JWT (decodifica `exp`, rechaza `token-otp-verificado` mock, auto-logout si expirado).

**Frontend `bomberos-frontend/src/views/RegistroProfesionalView.vue`:**
- `procesarRegistro()` usa `authService.register()` con loading `cargandoRegistro` y `errorRegistro`.
- `procesarLogin()` con `cargandoLogin`/`errorLogin`, abre modal OTP si `requiereOtp`.
- `verificarCodigoOTP()` reemplaza mock por `authService.verifyOtp()` con `cargandoOtp`, `errorOtp` diferenciado (expirado/bloqueado/incorrecto) y `mensajeReenvio`.
- `reenviarCodigo()` real vía `authService.resendOtp()`.
- Importa `API_URL` desde `../config/api` y usa `authService.consultarSegip` con fallback fetch.

**Backend `backend/src/auth/`:**
- Nuevo `dto/resend-otp.dto.ts` y export en `dto/index.ts`.
- `auth.service.ts` nuevo método `resendOtp()` genera nuevo código `LOGIN_2FA`, envía vía `EmailService` (mock log).
- `auth.controller.ts` nuevo endpoint `POST /auth/resend-otp`.

### Fase 2 - Seguridad
**`bomberos-frontend/src/config/api.js`:**
- `API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'`
- `apiClient = axios.create({baseURL: API_URL})` con interceptores request (inyecta `Authorization: Bearer token`) y response (401 limpia sesión y redirige a `/login`). Mismos interceptores en `axios` global para compatibilidad.

**`bomberos-frontend/src/router/index.js`:**
- Helpers `parseJwt()`, `isTokenValid()` (valida `exp`, rechaza mock), `getUserRole()`, `clearSession()`.
- Rutas `/admin/*` con `meta.roles` y guard fortalecido que valida expiración y roles, limpia sesión si token expirado, redirige `requiresGuest` según rol (`EXTERNO→/admin/formularios`, `INTERNO/ADMIN→/admin/dashboard`).

**`bomberos-frontend/src/components/AppHeader.vue`:**
- `handleLogout()` real: `authService.logout()` borra `token/user/userRole` y `router.push('/login')`, nombre de usuario dinámico desde `authService.getUser()`.

---

## Configuración

### Frontend
```bash
cd bomberos-frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api
npm install
npm run dev # http://localhost:5173
```

### Backend
```bash
cd backend
cp .env.example .env
# Ajustar DATABASE_URL y JWT_SECRET
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev # http://localhost:3000/api
```

## Pruebas End-to-End (Fase 3)
1. Registro completo → ver OTP en `console.log` backend (`🔐 OTP para ...`) → verificar → acceso `/admin/formularios`
2. Login existente → recibir OTP → verificar → acceso
3. Reenviar OTP → `POST /auth/resend-otp` genera nuevo código, anterior invalidado
4. Sin token acceder a `/admin/*` → guard redirige a `/login`
5. Logout → borra `token/user/userRole` y redirige a login (probado en `AppHeader` y via interceptor 401)
6. Campos inválidos en registro → `errorRegistro` muestra mensajes de `ValidationPipe` (ej. `CI debe tener entre 7 y 20 caracteres`, `Email inválido`)

Builds verificados: `npm run build` frontend (Vite) y backend (Nest) sin errores.

## Próximos pasos (Fase Kerveros)
- `GET /auth/kerveros/callback` validación JWT Kerveros y emisión JWT interno con `role:INTERNO`.

