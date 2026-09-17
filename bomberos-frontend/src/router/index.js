import { createRouter, createWebHistory } from 'vue-router'

// ==========================================
// IMPORTAR LAYOUTS
// ==========================================
import AdminLayout from '../layouts/AdminLayout.vue'

// ==========================================
// IMPORTAR VISTAS PÚBLICAS
// ==========================================
import HomeView from '../views/HomeView.vue'
import HistoriaView from '../views/HistoriaView.vue'
import UbicacionView from '../views/UbicacionView.vue'
import ContactosView from '../views/ContactosView.vue'
import TramitesView from '../views/TramitesView.vue'
import RegistroProfesionalView from '../views/RegistroProfesionalView.vue'

// ==========================================
// IMPORTAR VISTAS KERVEROS (FASE KERVEROS)
// ==========================================
import KerverosLoginView from '../views/KerverosLoginView.vue'
import KerverosDashboardView from '../views/KerverosDashboardView.vue'
import KerverosCallbackView from '../views/KerverosCallbackView.vue'

// ==========================================
// IMPORTAR VISTAS CIUDADANO (HITO 10 - 3F2)
// ==========================================
import MisSolicitudesView from '../views/ciudadano/MisSolicitudesView.vue'
import NuevaSolicitudView from '../views/ciudadano/NuevaSolicitudView.vue'
import FormularioTramiteView from '../views/ciudadano/FormularioTramiteView.vue'
import SolicitudCiudadanoDetalleView from '../views/ciudadano/SolicitudCiudadanoDetalleView.vue'

// ==========================================
// IMPORTAR VISTAS ADMIN
// ==========================================
import FormulariosView from '../views/admin/FormulariosView.vue'
import CapacitacionView from '../views/admin/CapacitacionView.vue'
import RegsiipciNaturalView from '../views/admin/RegsiipciNaturalView.vue'
import RegsiipciJuridicoView from '../views/admin/RegsiipciJuridicoView.vue'
import DeclaracionView from '../views/admin/DeclaracionView.vue'
import RegprofnaturalView from '../views/admin/RegprofnaturalView.vue'
import RegprofnatujurView from '../views/admin/RegprofnatujurView.vue'
import BuscadorcodigoView from '../views/admin/BuscadorcodigoView.vue'
import RenovacionesView from '../views/admin/RenovacionesView.vue'
import AlasdeltaView from '../views/admin/AlasdeltaView.vue'

// ==========================================
// SERVICIO DE AUTENTICACIÓN
// ==========================================
import { authService } from '../services/auth.service.js'

// ==========================================
// HELPERS JWT - Validación y Roles (FASE 2)
// ==========================================
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function isTokenValid() {
  const token = localStorage.getItem('token')
  if (!token) return false
  // Compatibilidad con token mock antiguo "token-otp-verificado" -> inválido, forzar re-login
  if (token === 'token-otp-verificado') return false
  const payload = parseJwt(token)
  if (!payload) return false
  // Si tiene exp, verificar expiración
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    return false
  }
  return true
}

function getUserRole() {
  // Prioridad: localStorage userRole -> payload JWT -> user objeto
  const storedRole = localStorage.getItem('userRole')
  if (storedRole) return storedRole
  const token = localStorage.getItem('token')
  if (token) {
    const payload = parseJwt(token)
    if (payload) return payload.role || payload.tipo_persona || null
  }
  try {
    const raw = localStorage.getItem('user')
    if (raw) {
      const user = JSON.parse(raw)
      return user.role || user.tipo_persona || null
    }
  } catch {}
  return null
}

function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('userRole')
  localStorage.removeItem('tipoUsuario')
}

// ==========================================
// DEFINICIÓN DE RUTAS
// ==========================================
const routes = [
  // --- RUTAS PÚBLICAS ---
  { path: '/', name: 'home', component: HomeView, meta: { public: true } },
  { path: '/historia', name: 'historia', component: HistoriaView, meta: { public: true } },
  { path: '/ubicacion', name: 'ubicacion', component: UbicacionView, meta: { public: true } },
  { path: '/contactos', name: 'contactos', component: ContactosView, meta: { public: true } },
  { path: '/tramites', name: 'tramites', component: TramitesView, meta: { public: true } },
  { 
    path: '/consulta', 
    name: 'ConsultaPublica', 
    component: () => import('../views/ConsultaPublicaView.vue'), 
    meta: { public: true }, 
  },
  { 
    path: '/registro-profesional/:formularioSeleccionado?', 
    name: 'registro-profesional', 
    component: RegistroProfesionalView, 
    meta: { public: true },
    props: true 
  },

  // --- RUTAS DE AUTENTICACIÓN (Apuntando a la vista unificada) ---
  { path: '/login', name: 'Login', component: RegistroProfesionalView, meta: { public: true, requiresGuest: true } },
  { path: '/register', name: 'Register', component: RegistroProfesionalView, meta: { public: true, requiresGuest: true } },

  // --- RUTAS KERVEROS (FASE KERVEROS - Usuario Interno Policía) ---
  { 
    path: '/auth/kerveros', 
    name: 'kerveros-login', 
    component: KerverosLoginView, 
    meta: { public: true, requiresGuest: true } 
  },
  { 
    path: '/auth/kerveros/dashboard', 
    name: 'kerveros-dashboard', 
    component: KerverosDashboardView, 
    meta: { public: true, requiresGuest: true } 
  },
  { 
    path: '/auth/kerveros/callback', 
    name: 'kerveros-callback', 
    component: KerverosCallbackView, 
    meta: { public: true, requiresGuest: true } 
  },

  // --- RUTAS CIUDADANO (HITO 10 - 3F2) ---
  {
    path: '/mis-solicitudes/nueva/:submoduloId',
    name: 'FormularioTramite',
    component: FormularioTramiteView,
    meta: { requiresAuth: true, tipoUsuario: 'EXTERNO' },
  },
  {
    path: '/mis-solicitudes/nueva',
    name: 'NuevaSolicitud',
    component: NuevaSolicitudView,
    meta: { requiresAuth: true, tipoUsuario: 'EXTERNO' },
  },
  {
    path: '/mis-solicitudes/:codigo',
    name: 'SolicitudCiudadanoDetalle',
    component: SolicitudCiudadanoDetalleView,
    meta: { requiresAuth: true, tipoUsuario: 'EXTERNO' },
  },
  {
    path: '/mis-solicitudes',
    name: 'MisSolicitudes',
    component: MisSolicitudesView,
    meta: { requiresAuth: true, tipoUsuario: 'EXTERNO' },
  },

  // --- RUTAS ADMIN (PRIVADAS con roles) ---
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLoginView.vue'),
    meta: { requiresGuest: true },
  },
  // --- ADMIN PANEL (3E1): layout con sidebar/header ---
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, tipoUsuario: 'INTERNO' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboardView.vue'),
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN'] },
      },
      {
        path: 'solicitudes',
        name: 'AdminSolicitudes',
        component: () => import('../views/admin/SolicitudesListView.vue'),
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN'] },
      },
      {
        path: 'solicitudes/nueva',
        name: 'AdminSolicitudNueva',
        component: () => import('../views/admin/PlaceholderView.vue'),
        props: { titulo: 'Nueva Solicitud', descripcion: 'Formulario de alta de solicitud. Se conectará a la API en 3E2.' },
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN'] },
      },
      {
        path: 'solicitudes/:codigo',
        name: 'AdminSolicitudDetalle',
        component: () => import('../views/admin/SolicitudDetalleView.vue'),
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN'] },
      },
      {
        path: 'alertas',
        name: 'AdminAlertas',
        component: () => import('../views/admin/AlertasView.vue'),
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN', 'SUPERVISOR'] },
      },
      {
        path: 'certificados',
        name: 'AdminCertificados',
        component: () => import('../views/admin/CertificadosListView.vue'),
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN'] },
      },
      {
        path: 'inspecciones',
        name: 'AdminInspecciones',
        component: () => import('../views/admin/InspeccionesListView.vue'),
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN', 'SUPERVISOR', 'INSPECTOR'] },
      },
      {
        path: 'inspecciones/:id',
        name: 'AdminInspeccionDetalle',
        component: () => import('../views/admin/InspeccionDetalleView.vue'),
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN', 'SUPERVISOR', 'INSPECTOR'] },
      },
      {
        path: 'capacitaciones',
        name: 'AdminCapacitaciones',
        component: () => import('../views/admin/PlaceholderView.vue'),
        props: { titulo: 'Capacitaciones', descripcion: 'Gestión de cursos y talleres. Vista en construcción.' },
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN', 'SUPERVISOR'] },
      },
      {
        path: 'reportes',
        name: 'AdminReportes',
        component: () => import('../views/admin/PlaceholderView.vue'),
        props: { titulo: 'Reportes y Estadísticas', descripcion: 'Reportes operativos y estadísticas nacionales. Vista en construcción.' },
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN', 'SUPERVISOR', 'INSPECTOR', 'CAJERO'] },
      },
      {
        path: 'usuarios-permisos',
        name: 'AdminUsuariosPermisos',
        component: () => import('../views/admin/PlaceholderView.vue'),
        props: { titulo: 'Usuarios y Permisos', descripcion: 'Administración de usuarios internos y roles. Vista en construcción.' },
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['ADMIN'] },
      },
      {
        path: 'configuracion-sippci',
        name: 'AdminConfiguracionSippci',
        component: () => import('../views/admin/PlaceholderView.vue'),
        props: { titulo: 'Configuración SIPPCI', descripcion: 'Parámetros y configuración del sistema. Vista en construcción.' },
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['ADMIN'] },
      },
      {
        path: 'mapa',
        name: 'AdminMapa',
        component: () => import('../views/admin/MapaView.vue'),
        meta: { requiresAuth: true, tipoUsuario: 'INTERNO', roles: ['INTERNO', 'ADMIN', 'SUPERVISOR', 'INSPECTOR'] },
      },
    ],
  },
  // ⚠️ DEPRECATED: Rutas mock del flujo ciudadano antiguo
  // Se mantienen por compatibilidad pero serán eliminadas
  // Los ciudadanos ahora usan /mis-solicitudes
  { 
    path: '/admin/formularios', 
    name: 'admin-formularios', 
    component: FormulariosView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'INTERNO', 'ADMIN'] } 
  },
  { 
    path: '/admin/capacitacion-pj', 
    name: 'capacitacion', 
    component: CapacitacionView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'INTERNO', 'ADMIN'] } 
  },
  { 
    path: '/admin/certificacion-pn', 
    name: 'certificacion-pn', 
    component: RegsiipciNaturalView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'INTERNO', 'ADMIN'] } 
  },
  { 
    path: '/admin/certificacion-pj', 
    name: 'certificacion-pj', 
    component: RegsiipciJuridicoView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'INTERNO', 'ADMIN'] } 
  },
  { 
    path: '/admin/declaracion-jurada', 
    name: 'declaracion-jurada', 
    component: DeclaracionView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'INTERNO', 'ADMIN'] } 
  },
  { 
    path: '/admin/profesionales-pn', 
    name: 'profesionales-pn', 
    component: RegprofnaturalView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'INTERNO', 'ADMIN'] } 
  },
  { 
    path: '/admin/profesionales-pj', 
    name: 'profesionales-pj', 
    component: RegprofnatujurView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'INTERNO', 'ADMIN'] } 
  },
  { 
    path: '/admin/buscar-empresa', 
    name: 'buscar-empresa', 
    component: BuscadorcodigoView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'INTERNO', 'ADMIN'] } 
  },
  { 
    path: '/admin/renovaciones-pn', 
    name: 'renovaciones-pn', 
    component: RenovacionesView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'INTERNO', 'ADMIN'] } 
  },
  { 
    path: '/admin/alas-delta', 
    name: 'alas-delta', 
    component: AlasdeltaView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'INTERNO', 'ADMIN'] } 
  },
]

// ==========================================
// CREAR EL ROUTER
// ==========================================
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ==========================================
// GUARD DE NAVEGACIÓN FORTALECIDO (FASE 2)
// ==========================================
router.beforeEach((to, from, next) => {
  const tokenExists = !!localStorage.getItem('token')
  const isAuthenticated = isTokenValid()
  const userRole = getUserRole()
  const tipoUsuario = localStorage.getItem('tipoUsuario')

  // Si hay token pero está expirado/inválido -> limpiar sesión
  if (tokenExists && !isAuthenticated) {
    clearSession()
    localStorage.removeItem('tipoUsuario')
  }

  // Si la ruta requiere autenticación y no está autenticado / token inválido o expirado
  if (to.meta.requiresAuth && !isAuthenticated) {
    if (to.path.startsWith('/admin')) {
      return next('/admin/login')
    }
    return next('/login')
  }

  // CROSS-ROLE: Ciudadano (EXTERNO) intentando acceder a /admin → redirigir a su panel
  if (to.path.startsWith('/admin') && isAuthenticated && tipoUsuario === 'EXTERNO') {
    return next('/mis-solicitudes')
  }

  // CROSS-ROLE: Funcionario (INTERNO) intentando acceder a /mis-solicitudes → redirigir a admin
  if (to.path.startsWith('/mis-solicitudes') && isAuthenticated && tipoUsuario !== 'EXTERNO') {
    return next('/admin/dashboard')
  }

  // Verificación de roles en rutas /admin/* si está autenticado
  if (to.meta.requiresAuth && to.meta.roles && isAuthenticated) {
    if (userRole && !to.meta.roles.includes(userRole)) {
      if (userRole === 'INTERNO' || userRole === 'ADMIN') {
        return next('/admin/dashboard')
      }
      return next('/mis-solicitudes')
    }
  }

  // Validar tipo de usuario para rutas admin internas (solo INTERNO)
  if (to.path.startsWith('/admin') && to.meta.requiresAuth && isAuthenticated) {
    if (tipoUsuario && tipoUsuario !== 'INTERNO') {
      return next('/mis-solicitudes')
    }
  }

  // Si la ruta es solo para invitados (login/register) y ya está autenticado
  if (to.meta.requiresGuest && isAuthenticated) {
    if (to.path.startsWith('/admin')) {
      return next('/admin/dashboard')
    }
    if (userRole === 'INTERNO' || userRole === 'ADMIN') {
      return next('/admin/dashboard')
    }
    return next('/mis-solicitudes')
  }

  next()
})

export default router
