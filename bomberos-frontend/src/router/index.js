import { createRouter, createWebHistory } from 'vue-router'

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

  // --- RUTA LEGACY DASHBOARD (Temporal para ADMIN) ---
  { 
    path: '/admin/dashboard-legacy', 
    name: 'dashboard-legacy', 
    component: () => import('../views/DashboardView.vue'), 
    meta: { requiresAuth: true, roles: ['ADMIN'] } 
  },

  // --- FORMULARIOS USUARIO EXTERNO (Mantenidos fuera del layout admin) ---
  { 
    path: '/admin/formularios', 
    name: 'admin-formularios', 
    component: FormulariosView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR'] } 
  },
  { 
    path: '/admin/capacitacion-pj', 
    name: 'capacitacion', 
    component: CapacitacionView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR'] } 
  },
  { 
    path: '/admin/certificacion-pn', 
    name: 'certificacion-pn', 
    component: RegsiipciNaturalView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR'] } 
  },
  { 
    path: '/admin/certificacion-pj', 
    name: 'certificacion-pj', 
    component: RegsiipciJuridicoView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR'] } 
  },
  { 
    path: '/admin/declaracion-jurada', 
    name: 'declaracion-jurada', 
    component: DeclaracionView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR'] } 
  },
  { 
    path: '/admin/profesionales-pn', 
    name: 'profesionales-pn', 
    component: RegprofnaturalView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR'] } 
  },
  { 
    path: '/admin/profesionales-pj', 
    name: 'profesionales-pj', 
    component: RegprofnatujurView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR'] } 
  },
  { 
    path: '/admin/buscar-empresa', 
    name: 'buscar-empresa', 
    component: BuscadorcodigoView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR'] } 
  },
  { 
    path: '/admin/renovaciones-pn', 
    name: 'renovaciones-pn', 
    component: RenovacionesView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR'] } 
  },
  { 
    path: '/admin/alas-delta', 
    name: 'alas-delta', 
    component: AlasdeltaView, 
    meta: { requiresAuth: true, roles: ['EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR'] } 
  },

  // --- RUTA PADRE /admin CON AdminDashboardLayout ---
  {
    path: '/admin',
    component: () => import('../layouts/AdminDashboardLayout.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN', 'OFICIAL', 'CAPACITOR'] },
    children: [
      // Panel Principal (reemplaza DashboardView viejo por AdminPanelView)
      { 
        path: 'dashboard', 
        name: 'admin-dashboard', 
        component: () => import('../views/admin/dashboard/AdminPanelView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'OFICIAL', 'CAPACITOR'] } 
      },
      // Solicitudes > SIPPCI
      { 
        path: 'solicitudes/sippci', 
        name: 'admin-solicitudes-sippci', 
        component: () => import('../views/admin/dashboard/SippciView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'OFICIAL'] } 
      },
      // Solicitudes > SIPPCI > Reg. Profesionales
      { 
        path: 'solicitudes/sippci/profesionales', 
        name: 'admin-sippci-profesionales', 
        component: () => import('../views/admin/dashboard/ProfesionalesView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'OFICIAL'] } 
      },
      { 
        path: 'solicitudes/sippci/profesionales/natural', 
        name: 'admin-sippci-profesionales-natural', 
        redirect: { path: '/admin/solicitudes/sippci/profesionales', query: { tipo: 'Natural' } } 
      },
      { 
        path: 'solicitudes/sippci/profesionales/juridica', 
        name: 'admin-sippci-profesionales-juridica', 
        redirect: { path: '/admin/solicitudes/sippci/profesionales', query: { tipo: 'Jurídica' } } 
      },
      // Solicitudes > SIPPCI > Cumplimiento
      { 
        path: 'solicitudes/sippci/cumplimiento/certificacion', 
        name: 'admin-sippci-cumplimiento-certificacion', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'OFICIAL'] } 
      },
      { 
        path: 'solicitudes/sippci/cumplimiento/declaracion', 
        name: 'admin-sippci-cumplimiento-declaracion', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'OFICIAL'] } 
      },
      { 
        path: 'solicitudes/sippci/cumplimiento/renovacion', 
        name: 'admin-sippci-cumplimiento-renovacion', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'OFICIAL'] } 
      },
      // Solicitudes > Reglamentación / Turismo
      { 
        path: 'solicitudes/reglamentacion', 
        name: 'admin-solicitudes-reglamentacion', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'OFICIAL'] } 
      },
      { 
        path: 'solicitudes/turismo', 
        name: 'admin-solicitudes-turismo', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'OFICIAL'] } 
      },
      // Reportes
      { 
        path: 'reportes', 
        name: 'admin-reportes', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'OFICIAL'] } 
      },
      // Capacitaciones
      { 
        path: 'capacitaciones', 
        name: 'admin-capacitaciones', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'CAPACITOR'] } 
      },
      { 
        path: 'capacitaciones/cursos', 
        name: 'admin-capacitaciones-cursos', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'CAPACITOR'] } 
      },
      { 
        path: 'capacitaciones/programar', 
        name: 'admin-capacitaciones-programar', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'CAPACITOR'] } 
      },
      { 
        path: 'capacitaciones/inscripciones', 
        name: 'admin-capacitaciones-inscripciones', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'CAPACITOR'] } 
      },
      { 
        path: 'capacitaciones/calificar', 
        name: 'admin-capacitaciones-calificar', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'CAPACITOR'] } 
      },
      { 
        path: 'capacitaciones/certificados', 
        name: 'admin-capacitaciones-certificados', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN', 'CAPACITOR'] } 
      },
      // Usuarios
      { 
        path: 'usuarios/internos', 
        name: 'admin-usuarios-internos', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN'] } 
      },
      { 
        path: 'usuarios/externos', 
        name: 'admin-usuarios-externos', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN'] } 
      },
      { 
        path: 'usuarios/empresas', 
        name: 'admin-usuarios-empresas', 
        component: () => import('../views/admin/dashboard/EmpresasView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN'] } 
      },
      // Configuración / Auditoría
      { 
        path: 'configuracion', 
        name: 'admin-configuracion', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN'] } 
      },
      { 
        path: 'auditoria', 
        name: 'admin-auditoria', 
        component: () => import('../views/admin/PlaceholderView.vue'), 
        meta: { requiresAuth: true, roles: ['ADMIN'] } 
      },
    ]
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
// Roles soportados: ADMIN, OFICIAL, CAPACITOR, EXTERNO
// ==========================================
router.beforeEach((to, from, next) => {
  const tokenExists = !!localStorage.getItem('token')
  const isAuthenticated = isTokenValid()
  const userRole = getUserRole()

  const esInterno = userRole === 'ADMIN' || userRole === 'OFICIAL' || userRole === 'CAPACITOR'

  // Si hay token pero está expirado/inválido -> limpiar sesión
  if (tokenExists && !isAuthenticated) {
    clearSession()
  }

  // Si la ruta requiere autenticación y no está autenticado / token inválido o expirado
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  // Verificación de roles en rutas /admin/* si está autenticado
  if (to.meta.requiresAuth && to.meta.roles && isAuthenticated) {
    if (userRole && !to.meta.roles.includes(userRole)) {
      // Rol no autorizado -> redirigir según rol
      if (esInterno) {
        return next('/admin/dashboard')
      }
      // EXTERNO no tiene acceso al panel admin -> redirigir a login
      return next('/login')
    }
  }

  // Si la ruta es solo para invitados (login/register) y ya está autenticado
  if (to.meta.requiresGuest && isAuthenticated) {
    // Redirigir según rol: EXTERNO -> formularios, internos -> dashboard
    if (esInterno) {
      return next('/admin/dashboard')
    }
    return next('/admin/formularios')
  }

  next()
})

export default router
