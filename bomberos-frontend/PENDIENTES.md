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

### 2. Agregar roles OFICIAL y CAPACITOR al backend
El backend actual solo tiene ADMIN, INTERNO, EXTERNO. Falta agregar
OFICIAL y CAPACITOR a:
- schema.prisma (enum de roles)
- auth.service.js (validación al login)
- RolesGuard en NestJS (validación de endpoints)
- Seeders de usuarios de prueba

### 3. Migrar usePermisos a Pinia
Actualmente lee localStorage directamente. Cuando se implemente Pinia,
migrar a un store centralizado.
