# Pendientes — Frontend SIPPCI

## Deuda técnica conocida

### 1. Mover formularios del EXTERNO fuera de /admin/*
Las rutas /admin/formularios, /admin/certificacion-pn, /admin/profesionales-pn,
etc. son formularios del USUARIO EXTERNO, no del admin interno. Están
mal ubicadas bajo /admin/*. En una fase posterior deben moverse a /usuario/*.

Rutas a mover (cuando se haga la refactorización):
- /admin/formularios → /usuario/formularios
- /admin/capacitacion-pj → /usuario/capacitacion-pj
- /admin/certificacion-pn → /usuario/certificacion-pn
- /admin/certificacion-pj → /usuario/certificacion-pj
- /admin/declaracion-jurada → /usuario/declaracion-jurada
- /admin/profesionales-pn → /usuario/profesionales-pn
- /admin/profesionales-pj → /usuario/profesionales-pj
- /admin/buscar-empresa → /usuario/buscar-empresa
- /admin/renovaciones-pn → /usuario/renovaciones-pn
- /admin/alas-delta → /usuario/alas-delta

Razón: Evitar confusión entre rutas del admin interno y del usuario externo.

## ✅ Completado — Alineación de roles (2026-09-16)

- [x] Enum Role agregado a schema.prisma (EXTERNO, ADMIN, OFICIAL, CAPACITOR) — `backend/prisma/schema.prisma:18`
- [x] Migración aplicada: role String → Role enum (DROP+ADD seguro, 11 EXTERNO)
- [x] Fix exchangeKerverosToken: role se lee de Kerveros, se valida contra whitelist, fallback OFICIAL con warning, se persiste en BD, se emite en JWT — `backend/src/auth/auth.service.ts:27`
- [x] Seed con 3 usuarios internos (admin 7711111, oficial 9905200, capacitor 6622222) — `backend/prisma/seed.ts`
- [x] Verificación E2E: 3/3 roles pasan login correctamente (ADMIN/OFICIAL/CAPACITOR)
- [x] Limpieza de artefactos de agentes (.agents/.claude/.cursor/.devin) + postinstall eliminado — `backend/package.json:21` / `.gitignore`
- [x] Proyecto sin historial formal de migraciones — crear baseline pendiente (nota: migración actual aplicada vía raw SQL por falta de baseline)

## ⏳ Pendiente — Próximas fases

- [ ] Frontend: componentes reutilizables (StatCard, DataTable, etc.)
- [ ] Frontend: AdminSidebar con filtrado por rol
- [ ] Backend: RolesGuard + JwtStrategy (protección de endpoints)
- [ ] Backend: Mover formularios externos de /admin/* a /usuario/* — ver §1 arriba
- [ ] Backend: Agregar tablas faltantes para módulos específicos

### 2. ~~Agregar roles OFICIAL y CAPACITOR al backend~~ ✅ COMPLETADO 2026-09-16
El backend actual solo tenía ADMIN, INTERNO, EXTERNO. Se agregó OFICIAL y CAPACITOR en:
- [x] schema.prisma (enum Role)
- [x] auth.service.ts (validación exchangeKerverosToken con whitelist)
- [ ] RolesGuard en NestJS (validación de endpoints) — pendiente próxima fase
- [x] Seeders de usuarios de prueba — `backend/prisma/seed.ts`

### 3. Migrar usePermisos a Pinia
Actualmente lee localStorage directamente. Cuando se implemente Pinia,
migrar a un store centralizado.
