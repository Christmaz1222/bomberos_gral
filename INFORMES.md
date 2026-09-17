# 📘 SIPPCI V2.1 — Informe Consolidado del Proyecto

**Proyecto**: Plataforma Integral de Gestión de Trámites de la Dirección Nacional de Bomberos (DNB)
**Repositorio**: `bomberos_gral` (monorepo)
**Stack**: NestJS 11 + Prisma 5.22 + PostgreSQL 17 + Vue 3 + Vite 8 + Tailwind 4
**Última actualización**: 17/09/2026 — Post FASE 6
**Estado general**: ✅ Sistema funcional end-to-end + 6/6 formularios legacy implementados

---

## 🎯 RESUMEN EJECUTIVO

SIPPCI V2.1 es una plataforma integral para la gestión de trámites de la Dirección Nacional de Bomberos. Reemplaza un sistema legacy PHP con vulnerabilidades críticas (SQL injection, flujo de aprobación roto, sin certificados oficiales) con una arquitectura moderna, segura y escalable.

**Logros principales:**
- ✅ **Ciclo completo end-to-end**: registro → solicitud → documentos → pago → certificado QR
- ✅ **Autenticación dual**: ciudadano (registro propio) + funcionario (Kerberos SSO simulado)
- ✅ **6/6 formularios legacy** con campos exactos y migración factible
- ✅ **RBAC granular** con 23 permisos y caché en memoria
- ✅ **Consulta pública** (código + QR) con privacidad respetada
- ✅ **Comprobante PDF** de registro
- ✅ **Gestión de trámites** en sesión del ciudadano
- ✅ **43 endpoints** documentados con Swagger
- ✅ **29 tablas** en PostgreSQL

---

## 📊 ESTADO DE FASES

| # | Fase | Descripción | Estado | Fecha |
|---|------|-------------|--------|-------|
| 1 | Seguridad P0 | Password hash, email real, kerberos base | ✅ | 10/09/2026 |
| 2A | SMTP real | Gmail + fallback | ✅ | 10/09/2026 |
| 2B | Herramientas | Swagger + Logs (pino) + Prisma Studio | ✅ | 11/09/2026 |
| Fase 1 | Registro ciudadano | Sin NIT/SEGIP + confirmación + AppButton | ✅ | 11/09/2026 |
| G-N1a | Seed + enum | 3 módulos + 9 submódulos + enum EstadoSolicitud | ✅ | 14/09/2026 |
| 3A | Bugs P1 | isAuthenticated, kerveros, HistoriaView | ✅ | 15/09/2026 |
| 3A-F | Frontend presentable | Branding, botones, empty-states | ✅ | 15/09/2026 |
| G-Ra | 5 tablas base | usuarios_internos, sesiones, usuarios_empresas, configuracion_modulos, historial_solicitudes | ✅ | 15/09/2026 |
| G-Rb1 | 6 tablas auditoría | auditoria_general, auditoria_cambios, alertas_admin, parametros_sistema, cache_catalogos, intentos_login | ✅ | 15/09/2026 |
| G-Rb2 | 5 tablas dominio | sippci_datos, reglamentacion_datos, turismo_datos, capacitacion_datos, solicitudes_renovacion | ✅ | 15/09/2026 |
| G-N1b1 | SolicitudesModule base | POST + GET mias + GET codigo | ✅ | 15/09/2026 |
| G-N1b2a | Documentos | 4 endpoints con checksum SHA-256 | ✅ | 15/09/2026 |
| G-N1b2b | Pago + estados | Pago simulado + state machine | ✅ | 15/09/2026 |
| G-N2 | Certificado QR | PDF + QR + verificación pública | ✅ | 15/09/2026 |
| 3D | Login Kerberos | Autenticación dual completa | ✅ | 15/09/2026 |
| 3E1 | Admin Dashboard | Layout + KPIs mock | ✅ | 15/09/2026 |
| 3E2a | Backend admin | 5 endpoints admin | ✅ | 15/09/2026 |
| 3E2b | Conectar dashboard | KPIs reales + loading states | ✅ | 15/09/2026 |
| 3E3a | Vista solicitudes | Tabla + filtros + paginación | ✅ | 15/09/2026 |
| 3E3b | Detalle + alertas | Timeline + gestión | ✅ | 15/09/2026 |
| 3E3c1 | Cambio estado | State machine + roles | ✅ | 15/09/2026 |
| 3E3c2 | Alertas + descarga | Marcar leídas + descargar docs | ✅ | 15/09/2026 |
| RBAC1 | Sistema permisos | 23 permisos + caché | ✅ | 15/09/2026 |
| 3F1 | Fix login admin | KERVEROS_MOCK_MODE=true | ✅ | 15/09/2026 |
| 3F2 | Dashboard ciudadano | /mis-solicitudes + filtrado | ✅ | 15/09/2026 |
| 3F3 | Formulario base | Con campos inventados (corregir) | ⚠️ | 15/09/2026 |
| FASE 1 | Legacy Analysis | 6 formularios + 7 catálogos + mapeo ETL | ✅ | 16/09/2026 |
| FASE 2 | Checklist requisitos | 6 items base + bloqueo estado | ✅ | 16/09/2026 |
| FASE 3a | REGPROF | Formularios 03/04 con campos legacy | ✅ | 16/09/2026 |
| FASE 3a-fix | Backend tipo_persona | Fix + código PJ/PN | ✅ | 16/09/2026 |
| FASE 3b | SIPPCI | Formularios 01/02 | ✅ | 16/09/2026 |
| FASE 3c | CAPAC + DECLA | Formularios 05/06 + submódulo 10 | ✅ | 16/09/2026 |
| FASE 3d | Fix Declaración | Frontend con submódulo 10 | ✅ | 16/09/2026 |
| FASE 4 | Comprobante PDF | Generación automática + descarga | ✅ | 16/09/2026 |
| FASE 5 | Consulta pública | /consulta + rate limiting + privacidad | ✅ | 17/09/2026 |
| FASE 6 | Agregar trámites | Gestión en sesión ciudadano | ✅ | 17/09/2026 |
| FASE 7 | Módulo inspección | Pendiente | ⏳ | — |
| FASE 8 | Mapa interactivo | Pendiente | ⏳ | — |
| FASE 9 | Libélula real | Pendiente | ⏳ | — |

---

## 🗄️ BASE DE DATOS (29 tablas)

### Autenticación (6)
- `usuarios` — Ciudadanos
- `usuarios_internos` — Funcionarios DNB (con permisos JSON)
- `sesiones` — Control de sesiones
- `codigos_verificacion` — OTP/RESET
- `intentos_login` — Rate limiting
- `usuarios_empresas` — Relación N:N usuario-empresa

### Empresas (1)
- `empresas` — Personas jurídicas

### Módulos (3)
- `modulos` — Módulos (SIPPCI, REGLAMENTACION, TURISMO)
- `submodulos` — Submódulos (10 con Declaración Jurada)
- `configuracion_modulos` — Configuración por submódulo

### Trámites (4)
- `solicitudes` — Solicitudes
- `historial_solicitudes` — Trazabilidad
- `documentos_solicitudes` — Documentos
- `formulario_respuesta` — Respuestas JSON

### Dominios (4)
- `sippci_datos` — Datos M1 SIPPCI
- `reglamentacion_datos` — Datos reglamentación
- `turismo_datos` — Datos turismo
- `capacitacion_datos` — Datos capacitación

### Finanzas (1)
- `pagos` — Pagos

### Certificados (2)
- `certificados_habilitacion` — Certificados con QR
- `solicitudes_renovacion` — Renovaciones

### Notificaciones (1)
- `notificaciones` — Notificaciones

### Alertas y Auditoría (3)
- `alertas_admin` — Alertas admin
- `auditoria_general` — Auditoría de acciones
- `auditoria_cambios` — Cambios campo a campo

### Parámetros (2)
- `parametros_sistema` — Configuración global
- `cache_catalogos` — Cache con TTL

### Requisitos (2)
- `requisitos` — Requisitos por trámite
- `solicitud_requisitos` — Estado de requisitos

---

## 🔌 ENDPOINTS (43)

### Autenticación (`/api/auth`) — 12 endpoints
- `POST /register` — Registro ciudadano
- `POST /login` — Login
- `POST /verify-otp` — Verificar OTP
- `POST /resend-otp` — Reenviar OTP
- `POST /forgot-password` — Recuperar contraseña
- `POST /reset-password` — Reset contraseña
- `GET /perfil` — Perfil del usuario
- `POST /kerveros/exchange` — Intercambio token Kerberos
- `GET /kerveros/callback` — Callback Kerberos
- `GET /tramites` — Listar trámites del usuario
- `POST /tramites/agregar` — Agregar trámite
- `DELETE /tramites/:nombre` — Quitar trámite

### Solicitudes (`/api/solicitudes`) — 11 endpoints
- `POST /` — Crear solicitud
- `GET /mias` — Mis solicitudes
- `GET /:codigo` — Detalle por código
- `GET /:codigo/comprobante` — Descargar comprobante
- `POST /:codigo/documentos` — Subir documento
- `GET /:codigo/documentos` — Listar documentos
- `GET /:codigo/documentos/:id/descargar` — Descargar documento
- `DELETE /:codigo/documentos/:id` — Eliminar documento
- `POST /:codigo/pago` — Iniciar pago
- `GET /:codigo/pago` — Consultar pago
- `PATCH /:codigo/estado` — Cambiar estado
- `POST /:codigo/pago/webhook` — Webhook simulado

### Certificados (`/api`) — 4 endpoints
- `POST /solicitudes/:codigo/certificado` — Emitir certificado
- `GET /solicitudes/:codigo/certificado` — Ver certificado
- `GET /certificados/verificar/:codigoQr` — Verificar por QR
- `GET /certificados/:numeroRegistro` — Consultar por número

### Admin (`/api/admin`) — 13 endpoints
- `GET /stats` — KPIs del dashboard
- `GET /solicitudes` — Listar solicitudes
- `GET /solicitudes/:codigo` — Detalle
- `GET /solicitudes/:codigo/comprobante` — Descargar comprobante
- `GET /solicitudes/:codigo/documentos/:id/descargar` — Descargar doc
- `GET /solicitudes/:codigo/estados-permitidos` — Estados permitidos
- `PATCH /solicitudes/:codigo/estado` — Cambiar estado
- `GET /solicitudes/:codigo/requisitos` — Listar requisitos
- `PATCH /solicitudes/:codigo/requisitos/:id` — Actualizar requisito
- `GET /alertas` — Alertas
- `PATCH /alertas/:id/leida` — Marcar leída
- `PATCH /alertas/leer-todas` — Marcar todas
- `GET /guardia` — Estado de guardia

### Público (`/api/public`) — 2 endpoints
- `GET /solicitudes/:codigo/estado` — Consulta estado (público)
- `GET /certificados/verificar/:codigoQr` — Verificar certificado (público)

### Swagger (`/api/docs`)
- `GET /api/docs` — Explorer Swagger
- `GET /api/docs-json` — Documento JSON (OpenAPI)

---

## 🎨 FRONTEND

### Vistas Ciudadano (12)
- `HomeView.vue` — Home público
- `HistoriaView.vue` — Historia institucional
- `UbicacionView.vue` — Ubicación
- `ContactosView.vue` — Contactos
- `TramitesView.vue` — Trámites
- `RegistroProfesionalView.vue` — Registro + Login
- `KerverosLoginView.vue` — Login Kerberos
- `KerverosDashboardView.vue` — Dashboard ciudadano
- `KerverosCallbackView.vue` — Callback Kerberos
- `DashboardView.vue` — Panel principal
- `ConsultaPublicaView.vue` — Consulta pública
- `AdminLoginView.vue` — Login funcionarios

### Vistas de Solicitud Ciudadano (4)
- `ciudadano/MisSolicitudesView.vue` — Dashboard de solicitudes
- `ciudadano/SolicitudCiudadanoDetalleView.vue` — Detalle solicitud
- `ciudadano/NuevaSolicitudView.vue` — Selector de trámites
- `ciudadano/FormularioTramiteView.vue` — Formulario dinámico

### Formularios Legacy (7)
- `FormularioCertificacionJuridica.vue` — 01 SIPPCI-JUR
- `FormularioCertificacionNatural.vue` — 02 SIPPCI-NAT
- `FormularioProfesionalJuridica.vue` — 03 REGPROF-JUR
- `FormularioProfesionalNatural.vue` — 04 REGPROF-NAT
- `FormularioCapacitacion.vue` — 05 CAPACI-JUR
- `FormularioDeclaracionJurada.vue` — 06 DECLA-JUR
- `FormularioGenerico.vue` — Fallback

### Vistas Admin (16)
- `admin/AdminDashboardView.vue` — Dashboard con KPIs
- `admin/SolicitudesListView.vue` — Lista con filtros
- `admin/SolicitudDetalleView.vue` — Detalle con requisitos
- `admin/AlertasView.vue` — Panel de alertas
- `admin/CertificadosListView.vue` — Certificados
- `admin/CapacitacionView.vue` — Formulario capacitación
- `admin/DeclaracionView.vue` — Formulario declaración
- `admin/FormulariosView.vue` — Selección de formularios
- `admin/RegsiipciNaturalView.vue` — SIPPCI natural
- `admin/RegsiipciJuridicoView.vue` — SIPPCI jurídico
- `admin/RegprofnaturalView.vue` — REGPROF
- `admin/RegprofnatujurView.vue` — REGPROF mixto
- `admin/RenovacionesView.vue` — Renovaciones
- `admin/BuscadorcodigoView.vue` — Buscador por código
- `admin/AlasdeltaView.vue` — Consulta complementaria
- `admin/PlaceholderView.vue` — Placeholder genérico

### Componentes (12)
- `AppButton.vue` — Botón reutilizable
- `AppHeader.vue` — Header público
- `ToastContainer.vue` — Toasts
- `ConsultaBomberos.vue` — Consulta rápida
- `admin/AdminSidebar.vue` — Sidebar con roles
- `admin/AdminHeader.vue` — Header con búsqueda
- `admin/KpiCard.vue` — Tarjeta KPI
- `admin/EstadoBadge.vue` — Badge de estados
- `admin/PaginationControls.vue` — Paginación
- `admin/CambiarEstadoModal.vue` — Modal cambio estado
- `admin/RequisitosChecklist.vue` — Checklist requisitos

### Servicios (5)
- `auth.service.js` — Autenticación
- `admin.service.js` — Endpoints admin
- `public.service.js` — Consulta pública
- `kerveros.service.js` — Kerberos mock
- `solicitudes.service.js` — Solicitudes

---

## 🛠️ DECISIONES TÉCNICAS CLAVE

### Arquitectura
- **Monolito modular** (no microservicios)
- **Doble autenticación**: ciudadano + funcionario
- **State machine** para solicitudes (9 estados)
- **RBAC granular** con permisos JSON + caché

### Seguridad
- **Prisma prepared statements** (no SQL injection)
- **bcrypt** para passwords
- **JWT** con expiración
- **RBAC** con permisos por rol
- **Rate limiting** con Throttler
- **Auditoría** general + cambios

### Formularios
- **6 formularios legacy** con campos EXACTOS
- **Datos en JSON** (`datos_especificos`)
- **Catálogos hardcoded** (a migrar a BD)
- **Validaciones** en frontend + backend

### Comprobantes y certificados
- **PDFKit** para PDF
- **QRCode** para QR
- **Comprobante** de registro (no es certificado)
- **Certificado** con vigencia 2 años (Art. 13)

### Consulta pública
- **Sin auth** para estado por código
- **Rate limiting** 30/min
- **Privacidad**: nombre enmascarado, sin CI/email/teléfono/monto
- **Comprobante PDF** detrás de login

---

## 📋 ROADMAP PENDIENTE

### FASE 7 — Módulo inspección
- Verificar/crear modelo `Inspeccion`
- Endpoints: asignar inspector, completar inspección
- UI de inspecciones en admin
- Integración con state machine

### FASE 8 — Mapa interactivo
- Vista `/admin/mapa`
- Leaflet + OpenStreetMap
- Heatmap por zona
- Filtros por trámite/estado

### FASE 9 — Libélula real
- Integración real con API Libélula
- QR de pago
- Webhook con firma HMAC
- Generación de vaucher PDF
- Conciliación

### Deuda técnica pendiente
- Migrar catálogos hardcoded a BD
- Migración de datos legacy
- Notificaciones por email al cambiar estado
- Motor de riesgo (Art. 7-9)
- Mantenimiento periódico (Art. 23)

---

## 📊 MÉTRICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| Tablas en BD | 29 |
| Endpoints | 43 |
| Migraciones Prisma | 10 |
| Modelos Prisma | 29 |
| Controllers NestJS | 6 |
| Formularios legacy | 6/6 ✅ |
| Vistas Vue | 39 |
| Componentes Vue | 12 |
| Servicios JS | 5 |
| Fases completadas | 6 + Legacy |
| Documentación | Swagger + INFORMES.md |

---

## 🎓 CONTRIBUCIÓN ACADÉMICA

**Para la defensa de tesis:**

1. **Arquitectura moderna** vs legacy PHP
2. **Seguridad**: reemplaza SQL injection con Prisma
3. **State machine**: reemplaza flujo roto
4. **Certificados oficiales** con QR: no existían
5. **RBAC granular**: no existía
6. **Consulta pública**: no existía
7. **Migración factible**: campos exactos preservados
8. **Documentación completa**: Swagger + INFORMES

**Objetivos alcanzados:**
- ✅ 6/6 formularios legacy migrables
- ✅ Ciclo end-to-end funcional
- ✅ Autenticación dual
- ✅ Sistema escalable
- ✅ Código mantenible

---

## 📌 NOTAS FINALES

**Cómo usar este documento:**
- Referencia para la defensa
- Base para documentación técnica
- Onboarding de nuevos desarrolladores
- Tracking de progreso

**Mantenimiento:**
- Actualizar después de cada fase
- Versionar con commits
- Revisar antes de cada demo

---

**Última actualización**: 17/09/2026
**Próximo hito**: FASE 7 — Módulo inspección
**Estado general**: ✅ Sistema funcional end-to-end