# Credenciales de Prueba - KERVEROS (Simulacion)

> **Modo:** Desarrollo / Simulacion — NO usar en produccion.
> Las credenciales validan contra `MOCK_USERS` en `bomberos-frontend/src/services/kerveros.service.js:7`

## Tabla de usuarios mock

| CI | Password | Nombre | Grado | Unidad | Role | Email |
|----|----------|--------|-------|--------|------|-------|
| 7711111 | 123456 | MY. CARLOS ROJAS FLORES | MAYOR | COMANDO GENERAL BOMBEROS | ADMIN | admin@bomberos.gob.bo |
| 9905200 | 123456 | CAP. JUAN PEREZ MAMANI | CAPITAN | UNIDAD BOMBEROS LA PAZ | OFICIAL | oficial@bomberos.gob.bo |
| 6622222 | 123456 | SBT. ANA FLORES CONDORI | SUBTENIENTE | UNIDAD BOMBEROS COCHABAMBA | CAPACITOR | capacitor@bomberos.gob.bo |
| 8812345 | 123456 | TEN. MARIA GOMEZ QUISPE | TENIENTE | UNIDAD BOMBEROS SANTA CRUZ | OFICIAL | mgomez@policia.bo |

## Roles internos soportados

| Rol | Acceso al panel | Solicitudes | Capacitaciones | Usuarios/Config/Auditoria |
|-----|-----------------|-------------|----------------|---------------------------|
| ADMIN | Full | Gestionar | Gestionar | Si |
| OFICIAL | Full | Gestionar (aprobar/observar/rechazar) | No | No |
| CAPACITOR | Panel Principal solo lectura | No | Gestionar | No |

> **Fuente:** `bomberos-frontend/src/services/kerveros.service.js:8-44` — si se modifica `MOCK_USERS`, actualizar esta tabla.

## Flujo de Prueba (End-to-End Simulacion)

1. Levantar servicios:
   ```bash
   cd backend && npm run start:dev        # http://localhost:3000/api
   cd bomberos-frontend && npm run dev    # http://localhost:5173
   ```
2. Ir a: `http://localhost:5173/auth/kerveros`
3. Ingresar CI/Password de la tabla (ej. `9905200 / 123456` para OFICIAL)
4. Ver Dashboard KERVEROS con 6 apps
5. Hacer clic en SIPPCI -> callback -> JWT interno con role correcto
6. Se guarda `token`, `user`, `userRole` en localStorage y se redirige a `/admin/dashboard`

## Comprobacion en BD

```sql
SELECT id, ci, nombre_completo, email, tipo_persona, role, grado, unidad, verificado FROM "Usuario" WHERE ci IN ('9905200','7711111','6622222');
```

## Notas

- Estas credenciales son SOLO para desarrollo
- En produccion se redirige a `https://kerveros-dev.policia.bo/auth`
- Los usuarios se crean/actualizan automaticamente en BD al intercambiar token
- Los 4 usuarios comparten password `123456` solo para facilitar pruebas
