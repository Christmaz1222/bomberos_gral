# 🚀 Guía de Migración a Producción - KERVEROS

## Resumen
KERVEROS está **simulado** para desarrollo (`MOCK_USERS` + token `btoa` + `jwt decode` sin verificación). Para conectar con KERVEROS real (`https://kerveros-dev.policia.bo/`), solo se necesitan **3 cambios** (frontend + backend + env).

> **Referencia actual simulación:** `bomberos-frontend/src/services/kerveros.service.js:7` y `backend/src/auth/auth.service.ts:107` `validateKerverosToken()`.

---

## Cambio 1: Frontend - `loginKerveros()`

**Archivo:** `bomberos-frontend/src/services/kerveros.service.js:50`

**ANTES (Simulación):**
```javascript
async loginKerveros(ci, password) {
  await new Promise(r => setTimeout(r, 800));
  const user = MOCK_USERS.find(u => u.ci === ci && u.password === password);
  if (!user) throw { message: 'Credenciales inválidas. Verifique su CI y contraseña.' };
  const kerverosUserData = { ci: user.ci, nombre: user.nombre, grado: user.grado, unidad: user.unidad, email: user.email, role: user.role };
  localStorage.setItem('kerverosUser', JSON.stringify(kerverosUserData));
  const mockToken = this._generateMockKerverosToken(user);
  localStorage.setItem('kerverosToken', mockToken);
  return { success: true, user: kerverosUserData, token: mockToken };
}
```

**DESPUÉS (Producción):**
```javascript
async loginKerveros() {
  // Redirige al SSO real; el callback lo manejará KerverosCallbackView.vue
  const callbackUrl = `${window.location.origin}/auth/kerveros/callback`;
  window.location.href = `https://kerveros-dev.policia.bo/auth?redirect=${encodeURIComponent(callbackUrl)}`;
  // Ya NO se usa MOCK_USERS ni localStorage kerverosUser aquí
}
```
*Opcional:* mantener `exchangeKerverosToken()` igual — seguirá haciendo `POST /api/auth/kerveros/exchange`.

> Eliminar o dejar `MOCK_USERS` bajo `if (import.meta.env.DEV)` para no exponer credenciales.

---

## Cambio 2: Backend - `validateKerverosToken()`

**Archivo:** `backend/src/auth/auth.service.ts:107`

**ANTES (Simulación):**
```typescript
private async validateKerverosToken(token: string): Promise<KerverosPayload> {
  // EN DESARROLLO: Decodificar sin verificar (simulación)
  const payload = this.jwtService.decode(token) as KerverosPayload | null;
  if (!payload) throw new UnauthorizedException('Token de Kerveros inválido o malformado');
  if (payload['exp'] && Date.now() >= payload['exp'] * 1000) throw new UnauthorizedException('Token de Kerveros expirado');
  return { ci: payload.ci, nombre: payload.nombre, grado: payload.grado, unidad: payload.unidad, email: payload.email, role: payload.role };
}
```

**DESPUÉS (Producción):**
```typescript
private async validateKerverosToken(token: string): Promise<KerverosPayload> {
  // 1. Obtener JWKS real
  const jwksUrl = process.env.KERVEROS_JWKS_URL || 'https://kerveros-dev.policia.bo/.well-known/jwks.json';
  const jwksResponse = await fetch(jwksUrl);
  if (!jwksResponse.ok) throw new UnauthorizedException('No se pudo obtener JWKS de Kerveros');
  const jwks = await jwksResponse.json();
  // 2. Verificar firma RS256 (requiere jsonwebtoken + jwks-rsa o similar)
  // Ejemplo con 'jsonwebtoken' + 'jwks-rsa':
  // const client = jwksRsa({ jwksUri: jwksUrl });
  // const key = await client.getSigningKey(kid);
  // return this.jwtService.verify(token, { secret: key.getPublicKey(), algorithms: ['RS256'] });

  // Simplificado si el JWKS expone x5c:
  return this.jwtService.verify(token, {
    secret: jwks.keys[0].x5c[0], // reemplazar por clave pública PEM real
    algorithms: ['RS256'],
  }) as KerverosPayload;
}
```
*Dependencias sugeridas:* `npm i jwks-rsa jsonwebtoken` y configurar `JwtModule` con `RS256`.

> Mantener validación de `exp`, `iss: kerveros-dev.policia.bo`, `aud: sippci-bomberos`.

---

## Cambio 3: Variables de Entorno

**Archivo:** `backend/.env` — **AGREGAR** (no commitear, solo documentar en `.env.example`):

```env
# KERVEROS Producción
KERVEROS_AUTH_URL=https://kerveros-dev.policia.bo/auth
KERVEROS_JWKS_URL=https://kerveros-dev.policia.bo/.well-known/jwks.json
KERVEROS_CALLBACK_URL=https://tusistema.com/auth/kerveros/callback
KERVEROS_AUDIENCE=sippci-bomberos
KERVEROS_ISSUER=https://kerveros-dev.policia.bo
JWT_SECRET_KERVEROS=clave_publica_o_secreto_del_proveedor
```

**Archivo:** `backend/.env.example` — agregar placeholders (ya existe `JWT_SECRET`, añadir líneas `KERVEROS_*`).

**Archivo:** `bomberos-frontend/.env` / `.env.example` — **AGREGAR**:

```env
VITE_KERVEROS_AUTH_URL=https://kerveros-dev.policia.bo/auth
VITE_KERVEROS_CALLBACK_URL=https://tusistema.com/auth/kerveros/callback
VITE_API_URL=http://localhost:3000/api
```

---

## Checklist de Migración

- [ ] Cambio 1: Modificar `loginKerveros()` en `bomberos-frontend/src/services/kerveros.service.js`
- [ ] Cambio 2: Modificar `validateKerverosToken()` en `backend/src/auth/auth.service.ts` para verificar con JWKS (`RS256`)
- [ ] Cambio 3: Agregar variables `KERVEROS_*` en `backend/.env` y `bomberos-frontend/.env` (+ `.env.example`)
- [ ] Probar con credenciales reales de KERVEROS (no MOCK_USERS)
- [ ] Verificar creación/actualización de `Usuario` en BD con `role:INTERNO` y `tipo_persona:INTERNO`
- [ ] Verificar JWT emitido con `role:INTERNO` y `exp 7d` (`auth.service.ts:88`)
- [ ] Verificar flujo: `https://kerveros-dev.policia.bo` → `/auth/kerveros/callback?token=...` → `POST /kerveros/exchange` → `/admin/dashboard` con guard `roles: ['INTERNO','ADMIN']`
- [ ] Probar en staging con `CORS_ORIGIN` y `FRONTEND_URL` productivos
- [ ] `npm run build` frontend + backend sin errores, `git restore backend/dist`
- [ ] Deploy a producción (no subir `dist/` ni `.env`)

**Tiempo estimado:** 1–2 horas (según acceso a JWKS y credenciales KERVEROS).

---

## Notas

- No romper flujo externo `POST /auth/login` → `POST /auth/verify-otp` (OTP 6 dígitos) — independiente de KERVEROS.
- Los badges amarillos `🔧 Modo Desarrollo - Simulación` (`KerverosLoginView.vue` y `KerverosDashboardView.vue`) deben ocultarse en prod con `v-if="import.meta.env.DEV"`.
- `KERVEROS_TEST_CREDENTIALS.md` es solo para dev — no desplegar.
