<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
            <span class="text-white text-xl">🚒</span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">Mis Solicitudes</h1>
            <p class="text-xs text-gray-500">Portal Ciudadano — DNB</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden md:flex flex-col text-right">
            <span class="text-sm font-semibold text-gray-800">{{ usuario.nombre }}</span>
            <span class="text-[10px] text-gray-500 font-mono">{{ usuario.email }}</span>
          </div>
          <button
            @click="cerrarSesion"
            class="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
            title="Cerrar sesión"
          >
            <span class="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido -->
    <main class="max-w-6xl mx-auto px-4 py-6">
      <!-- Bienvenida + Acción -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            Bienvenido, {{ usuario.nombre?.split(' ')[0] || 'Ciudadano' }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            Gestiona tus trámites y certificados de la DNB
          </p>
        </div>
        <RouterLink
          to="/mis-solicitudes/nueva"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
        >
          <span class="material-symbols-outlined text-[20px]">add_circle</span>
          Nueva Solicitud
        </RouterLink>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total</span>
            <span class="material-symbols-outlined text-blue-600 text-[20px]">folder</span>
          </div>
          <div class="text-3xl font-bold text-gray-900">{{ stats.total }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">En Proceso</span>
            <span class="material-symbols-outlined text-orange-500 text-[20px]">schedule</span>
          </div>
          <div class="text-3xl font-bold text-orange-600">{{ stats.enProceso }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Aprobadas</span>
            <span class="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
          </div>
          <div class="text-3xl font-bold text-green-600">{{ stats.aprobadas }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Certificados</span>
            <span class="material-symbols-outlined text-red-600 text-[20px]">verified</span>
          </div>
          <div class="text-3xl font-bold text-red-600">{{ stats.certificados }}</div>
        </div>
      </div>

      <!-- Trámites habilitados -->
      <div v-if="tramitesHabilitados.length" class="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-gray-900 text-sm uppercase tracking-wider">
            Mis Trámites Habilitados
          </h3>
          <span class="text-xs text-gray-500">{{ tramitesHabilitados.length }} habilitados</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="t in tramitesHabilitados"
            :key="t.id"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold"
          >
            <span class="material-symbols-outlined text-[14px]">check_circle</span>
            {{ t.nombre }}
          </span>
        </div>
      </div>

      <!-- Lista de solicitudes -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h3 class="font-bold text-gray-900">Historial de Solicitudes</h3>
          <div class="flex items-center gap-2">
            <select
              v-model="filtroEstado"
              class="text-xs px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600/30"
            >
              <option value="">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PENDIENTE_PAGO">Pendiente Pago</option>
              <option value="EN_VERIFICACION">En Revisión</option>
              <option value="OBSERVADO">Observado</option>
              <option value="APROBADO">Aprobado</option>
              <option value="CERTIFICADO_EMITIDO">Certificado</option>
            </select>
            <button
              @click="cargar"
              :disabled="cargando"
              class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title="Refrescar"
            >
              <span
                class="material-symbols-outlined text-[18px]"
                :class="{ 'animate-spin': cargando }"
              >
                refresh
              </span>
            </button>
          </div>
        </div>

        <!-- Skeleton -->
        <div v-if="cargando" class="space-y-3 animate-pulse">
          <div v-for="i in 3" :key="i" class="h-20 bg-gray-100 rounded-lg"></div>
        </div>

        <!-- Lista real -->
        <div v-else-if="solicitudesFiltradas.length" class="flex flex-col gap-3">
          <RouterLink
            v-for="s in solicitudesFiltradas"
            :key="s.codigo"
            :to="`/mis-solicitudes/${s.codigo}`"
            class="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-gray-100 hover:border-red-600/30 hover:bg-gray-50 transition-all group"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">{{ s.modulo }}</span>
                <EstadoBadge :estado="s.estado" />
              </div>
              <div class="font-mono font-bold text-gray-900 truncate">{{ s.codigo }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ s.submodulo }}</div>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-500">
              <span>{{ formatearFecha(s.fecha_solicitud) }}</span>
              <span class="material-symbols-outlined text-[18px] text-gray-400 group-hover:text-red-600 transition-colors">
                arrow_forward
              </span>
            </div>
          </RouterLink>
        </div>

        <!-- Empty state -->
        <div v-else class="py-16 text-center">
          <span class="material-symbols-outlined text-6xl text-gray-300">inbox</span>
          <h3 class="mt-3 font-semibold text-gray-700">No tienes solicitudes</h3>
          <p class="text-sm text-gray-500 mt-1">
            Crea tu primera solicitud para comenzar
          </p>
          <RouterLink
            to="/mis-solicitudes/nueva"
            class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            Nueva Solicitud
          </RouterLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../config/api'
import EstadoBadge from '../../components/admin/EstadoBadge.vue'
import { useToast } from '../../composables/useToast'

const router = useRouter()
const toast = useToast()

const solicitudes = ref([])
const tramitesHabilitados = ref([])
const cargando = ref(true)
const filtroEstado = ref('')

const usuario = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return { nombre: 'Ciudadano', email: '' }
  }
})

const solicitudesFiltradas = computed(() => {
  if (!filtroEstado.value) return solicitudes.value
  return solicitudes.value.filter((s) => s.estado === filtroEstado.value)
})

const stats = computed(() => {
  const total = solicitudes.value.length
  const enProceso = solicitudes.value.filter((s) =>
    ['BORRADOR', 'PENDIENTE_PAGO', 'PAGO_CONFIRMADO', 'EN_VERIFICACION', 'OBSERVADO', 'APROBADO', 'INSPECCION'].includes(s.estado),
  ).length
  const aprobadas = solicitudes.value.filter((s) =>
    ['APROBADO', 'CERTIFICADO_EMITIDO'].includes(s.estado),
  ).length
  const certificados = solicitudes.value.filter((s) => s.estado === 'CERTIFICADO_EMITIDO').length
  return { total, enProceso, aprobadas, certificados }
})

async function cargar() {
  cargando.value = true
  try {
    // Cargar solicitudes
    const { data: solicitudesData } = await apiClient.get('/solicitudes/mias', {
      params: { limit: 100 },
    })
    solicitudes.value = solicitudesData.data || []

    // Cargar perfil para tramites_solicitados
    const { data: perfil } = await apiClient.get('/auth/perfil')
    const tramitesDelUsuario = perfil.tramites_solicitados || perfil.tramitesSolicitados || []

    const submodulos = getCatalogoSubmodulos()

    // Filtrar solo los habilitados
    tramitesHabilitados.value = submodulos.filter((sm) =>
      tramitesDelUsuario.includes(sm.nombre),
    )
  } catch (e) {
    console.error('Error cargando datos:', e)
    toast.error('No se pudieron cargar tus datos')
  } finally {
    cargando.value = false
  }
}

/**
 * Catálogo de submódulos (fallback local si no hay endpoint)
 * Los nombres coinciden 1:1 con tramites_solicitados
 */
function getCatalogoSubmodulos() {
  return [
    { id: 1, nombre: 'Registro de Profesionales', modulo: 'SIPPCI', icono: 'badge' },
    { id: 2, nombre: 'Capacitación', modulo: 'SIPPCI', icono: 'school' },
    { id: 3, nombre: 'Cumplimiento SIPPCI', modulo: 'SIPPCI', icono: 'assignment' },
    { id: 4, nombre: 'Armería', modulo: 'REGLAMENTACION', icono: 'security' },
    { id: 5, nombre: 'Campos de Tiro', modulo: 'REGLAMENTACION', icono: 'target' },
    { id: 6, nombre: 'Polígono de Tiro', modulo: 'REGLAMENTACION', icono: 'gps_fixed' },
    { id: 7, nombre: 'Actividades Aéreas', modulo: 'TURISMO', icono: 'flight' },
    { id: 8, nombre: 'Actividades Acuáticas', modulo: 'TURISMO', icono: 'kayaking' },
    { id: 9, nombre: 'Actividades Terrestres', modulo: 'TURISMO', icono: 'hiking' },
    { id: 10, nombre: 'Declaración Jurada', modulo: 'SIPPCI', icono: 'gavel' },
  ]
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('userRole')
  localStorage.removeItem('tipoUsuario')
  router.push('/login')
}

onMounted(() => {
  cargar()
})
</script>
