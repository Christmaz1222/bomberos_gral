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

## ✅ Completado — Panel Admin Frontend (2026-09-16)

### Componentes reutilizables (4)
- [x] StatCard.vue
- [x] ModuleProgressBar.vue
- [x] DataTable.vue
- [x] SectionTitle.vue

### Componentes admin (3)
- [x] AdminSidebar.vue (con filtrado por rol)
- [x] AdminHeader.vue (con búsqueda y perfil)
- [x] AdminDashboardLayout.vue

### Vistas admin (5)
- [x] AdminPanelView.vue (Panel Principal)
- [x] SippciView.vue
- [x] ProfesionalesView.vue (con filtro por tipo)
- [x] EmpresasView.vue (solo ADMIN)
- [x] PlaceholderView.vue

### Router
- [x] 19 rutas nuevas con AdminDashboardLayout como padre
- [x] Guards con filtrado por rol
- [x] Ajuste de filtro por tipo en profesionales (natural/juridica)
- [x] DashboardView viejo movido a /admin/dashboard-legacy

### Servicios y composables
- [x] usePermisos.js (3 roles: ADMIN, OFICIAL, CAPACITOR)
- [x] dashboard.mock.service.js

## ⏳ Pendiente — Próximas fases

- [ ] Verificación E2E manual con los 3 roles (login y navegación)
- [ ] Conectar backend real (reemplazar dashboard.mock.service.js por dashboard.service.js)
- [ ] Mover formularios del EXTERNO de /admin/* a /usuario/*
- [ ] Implementar RolesGuard + JwtStrategy en el backend
- [ ] Agregar tablas faltantes para módulos específicos
- [ ] Implementar vistas reales de solicitudes (con datos del backend)
- [ ] Implementar ExpedienteView (detalle de solicitud)
- [ ] Implementar certificados con QR
- [ ] Migrar usePermisos a Pinia
