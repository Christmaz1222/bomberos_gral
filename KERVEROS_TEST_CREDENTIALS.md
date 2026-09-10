# 🔑 Credenciales de Prueba - KERVEROS (Simulación)

> **Modo:** Desarrollo / Simulación — NO usar en producción.
> Las credenciales validan contra `MOCK_USERS` en `bomberos-frontend/src/services/kerveros.service.js:7`

## Tabla de usuarios mock

| CI | Password | Nombre | Grado | Unidad | Role | Email |
|----|----------|--------|-------|--------|------|-------|
| 9905200 | 123456 | CAP. JUAN PÉREZ MAMANI | CAPITÁN | UNIDAD BOMBEROS LA PAZ | INTERNO | jperez@policia.bo |
| 8812345 | 123456 | TEN. MARÍA GÓMEZ QUISPE | TENIENTE | UNIDAD BOMBEROS SANTA CRUZ | INTERNO | mgomez@policia.bo |
| 7711111 | 123456 | MY. CARLOS ROJAS FLORES | MAYOR | COMANDO GENERAL BOMBEROS | ADMIN | crojas@policia.bo |
| 6622222 | 123456 | SBT. ANA FLORES CONDORI | SUBTENIENTE | UNIDAD BOMBEROS COCHABAMBA | INTERNO | aflores@policia.bo |

> **Fuente:** `bomberos-frontend/src/services/kerveros.service.js:8-44` — si se modifica `MOCK_USERS`, actualizar esta tabla.

## Flujo de Prueba (End-to-End Simulación)

1. Levantar servicios:
   ```bash
   cd backend && npm run start:dev        # http://localhost:3000/api
   cd bomberos-frontend && npm run dev    # http://localhost:5173
   ```
2. Ir a: `http://localhost:5173/auth/kerveros`
3. Ingresar cualquier CI/Password de la tabla (ej. `9905200 / 123456`) → `kerverosService.loginKerveros():50` guarda `kerverosUser`+`kerverosToken` en `localStorage` y redirige a `/auth/kerveros/dashboard`
4. Ver **Dashboard KERVEROS** (`KerverosDashboardView.vue:103`): 6 apps, badge `SIMULACIÓN` visible, app principal **SIPPCI** destacada
5. Hacer clic en **🚒 SIPPCI** → `handleSippciClick():121` genera token mock `_generateMockKerverosToken()` y redirige a `/auth/kerveros/callback?token=xxx`
6. **Callback** (`KerverosCallbackView.vue:21`): lee `route.query.token`, llama `POST /api/auth/kerveros/exchange` (`auth.controller.ts:70`), backend `exchangeKerverosToken():27` busca/crea `Usuario` con `role:INTERNO` y emite JWT propio
7. Se guarda en `localStorage`: `token` (JWT 7d), `user`, `userRole=INTERNO` y se redirige a `/admin/dashboard` (ruta con `meta:{requiresAuth:true, roles:['INTERNO','ADMIN','EXTERNO']}` en `router/index.js:142`)

## Comprobación en BD

```sql
SELECT id, ci, nombre_completo, email, tipo_persona, role, grado, unidad, verificado FROM "Usuario" WHERE ci IN ('9905200','7711111');
-- Al primer login el usuario se crea automáticamente con password_hash aleatorio
```

## Notas

- ⚠️ Estas credenciales son **SOLO para desarrollo** (`kerveros.service.js:7` comentario `MODO SIMULACIÓN`)
- 🔧 En producción se redirige a `https://kerveros-dev.policia.bo/auth` — ver `KERVEROS_PRODUCTION_GUIDE.md`
- 📝 Los usuarios se crean/actualizan automáticamente en BD al intercambiar token (`auth.service.ts:38-75`)
- 🔒 El JWT emitido contiene `sub,email,nombre,ci,tipo_persona,role,grado,unidad` y expira en `7d` (`JwtModule` en `auth.module.ts:15`)
- 🧪 Los 4 usuarios comparten password `123456` solo para facilitar pruebas — cambiar en producción
