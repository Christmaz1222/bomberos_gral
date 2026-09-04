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

  // --- RUTAS ADMIN (PRIVADAS) ---
  { 
    path: '/admin/dashboard', 
    name: 'dashboard', 
    component: () => import('../views/DashboardView.vue'), 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin/formularios', 
    name: 'admin-formularios', 
    component: FormulariosView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin/capacitacion-pj', 
    name: 'capacitacion', 
    component: CapacitacionView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin/certificacion-pn', 
    name: 'certificacion-pn', 
    component: RegsiipciNaturalView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin/certificacion-pj', 
    name: 'certificacion-pj', 
    component: RegsiipciJuridicoView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin/declaracion-jurada', 
    name: 'declaracion-jurada', 
    component: DeclaracionView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin/profesionales-pn', 
    name: 'profesionales-pn', 
    component: RegprofnaturalView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin/profesionales-pj', 
    name: 'profesionales-pj', 
    component: RegprofnatujurView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin/buscar-empresa', 
    name: 'buscar-empresa', 
    component: BuscadorcodigoView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin/renovaciones-pn', 
    name: 'renovaciones-pn', 
    component: RenovacionesView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin/alas-delta', 
    name: 'alas-delta', 
    component: AlasdeltaView, 
    meta: { requiresAuth: true } 
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
// GUARD DE NAVEGACIÓN
// ==========================================
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()

  // Si la ruta requiere autenticación y no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // Si la ruta es solo para invitados (login/register) y ya está autenticado
  else if (to.meta.requiresGuest && isAuthenticated) {
    next('/admin/dashboard')
  } 
  // Si la ruta es pública (no requiere auth) y no está autenticado
  else {
    next()
  }
})

export default router