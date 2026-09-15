<template>
  <div class="flex flex-col gap-5">
    <!-- Encabezado -->
    <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded bg-dnb-primary text-white text-[10px] font-bold uppercase tracking-wider">
            Gestión
          </span>
          <span class="text-gray-500 text-xs">• Solicitudes</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Solicitudes</h1>
        <p class="text-sm text-gray-500 mt-1">
          Listado completo de trámites del sistema SIPPCI
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          @click="recargar"
          :disabled="cargando"
          class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <span
            class="material-symbols-outlined text-[18px]"
            :class="{ 'animate-spin': cargando }"
          >
            refresh
          </span>
          Refrescar
        </button>
      </div>
    </header>

    <!-- Filtros -->
    <div class="bg-white rounded-xl shadow-sm p-4">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
        <!-- Búsqueda -->
        <div class="md:col-span-6">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Buscar
          </label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[20px]">search</span>
            <input
              v-model="filtros.q"
              @input="debouncedBuscar"
              type="text"
              placeholder="Código, CI, razón social..."
              class="w-full h-10 pl-10 pr-10 rounded-lg bg-gray-50 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
            />
            <button
              v-if="filtros.q"
              @click="limpiarBusqueda"
              class="absolute right-2 top-2 p-1 rounded hover:bg-gray-200 text-gray-400"
            >
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        <!-- Estado -->
        <div class="md:col-span-3">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Estado
          </label>
          <select
            v-model="filtros.estado"
            @change="aplicarFiltros"
            class="w-full h-10 px-3 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="PENDIENTE_PAGO">Pendiente Pago</option>
            <option value="PAGO_CONFIRMADO">Pago Confirmado</option>
            <option value="EN_VERIFICACION">En Verificación</option>
            <option value="OBSERVADO">Observado</option>
            <option value="APROBADO">Aprobado</option>
            <option value="INSPECCION">Inspección</option>
            <option value="CERTIFICADO_EMITIDO">Certificado Emitido</option>
            <option value="ANULADO">Anulado</option>
          </select>
        </div>

        <!-- Módulo -->
        <div class="md:col-span-3">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Módulo
          </label>
          <select
            v-model="filtros.modulo"
            @change="aplicarFiltros"
            class="w-full h-10 px-3 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all cursor-pointer"
          >
            <option value="">Todos los módulos</option>
            <option value="SIPPCI">SIPPCI</option>
            <option value="REGLAMENTACION">Reglamentación</option>
            <option value="TURISMO">Turismo</option>
            <option value="CAPACITACION">Capacitación</option>
          </select>
        </div>
      </div>

      <!-- Filtros activos -->
      <div v-if="hayFiltrosActivos" class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Filtros activos:
        </span>
        <button
          v-if="filtros.estado"
          @click="limpiarFiltro('estado')"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors"
        >
          Estado: {{ formatearEstado(filtros.estado) }}
          <span class="material-symbols-outlined text-[14px]">close</span>
        </button>
        <button
          v-if="filtros.modulo"
          @click="limpiarFiltro('modulo')"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 transition-colors"
        >
          Módulo: {{ filtros.modulo }}
          <span class="material-symbols-outlined text-[14px]">close</span>
        </button>
        <button
          v-if="filtros.q"
          @click="limpiarFiltro('q')"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold hover:bg-orange-200 transition-colors"
        >
          "{{ filtros.q }}"
          <span class="material-symbols-outlined text-[14px]">close</span>
        </button>
        <button
          @click="limpiarTodosFiltros"
          class="text-xs text-gray-500 hover:text-red-600 underline transition-colors ml-auto"
        >
          Limpiar todo
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-sm p-4">
      <!-- Skeleton -->
      <div v-if="cargando" class="space-y-3 animate-pulse">
        <div class="h-12 bg-gray-100 rounded"></div>
        <div v-for="i in 5" :key="i" class="h-16 bg-gray-50 rounded"></div>
      </div>

      <!-- Tabla real -->
      <div v-else-if="solicitudes && solicitudes.data.length" class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider">
              <th class="py-3 px-3 rounded-l-lg">Código</th>
              <th class="py-3 px-3">Módulo</th>
              <th class="py-3 px-3">Solicitante</th>
              <th class="py-3 px-3">Tipo</th>
              <th class="py-3 px-3">Fecha</th>
              <th class="py-3 px-3">Estado</th>
              <th class="py-3 px-3 text-right rounded-r-lg">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="s in solicitudes.data"
              :key="s.codigo"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-3">
                <span class="font-mono font-bold text-gray-900 text-xs">{{ s.codigo }}</span>
              </td>
              <td class="py-3 px-3">
                <div class="flex flex-col">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium w-fit">
                    {{ s.modulo }}
                  </span>
                  <span class="text-[10px] text-gray-400 mt-0.5">{{ s.submodulo }}</span>
                </div>
              </td>
              <td class="py-3 px-3">
                <div class="flex flex-col min-w-[150px]">
                  <span class="font-semibold text-gray-900 truncate">
                    {{ s.empresa?.razon_social || s.solicitante?.nombre || '—' }}
                  </span>
                  <span class="text-[10px] text-gray-500 font-mono">
                    {{ s.empresa?.nit ? `NIT: ${s.empresa.nit}` : `CI: ${s.solicitante?.ci || '—'}` }}
                  </span>
                </div>
              </td>
              <td class="py-3 px-3">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold"
                  :class="s.tipo_persona === 'JURIDICA' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ s.tipo_persona === 'JURIDICA' ? 'Jurídica' : 'Natural' }}
                </span>
              </td>
              <td class="py-3 px-3">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-700">{{ formatearFecha(s.fecha_solicitud) }}</span>
                  <span class="text-[10px] text-gray-400">{{ tiempoRelativo(s.fecha_solicitud) }}</span>
                </div>
              </td>
              <td class="py-3 px-3">
                <EstadoBadge :estado="s.estado" />
              </td>
              <td class="py-3 px-3 text-right">
                <RouterLink
                  :to="`/admin/solicitudes/${s.codigo}`"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dnb-dark hover:bg-gray-800 text-white text-xs font-semibold transition-colors"
                >
                  <span class="material-symbols-outlined text-[16px]">folder_open</span>
                  Ver detalle
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-else class="py-16 text-center">
        <span class="material-symbols-outlined text-6xl text-gray-300">inbox</span>
        <h3 class="mt-3 text-lg font-semibold text-gray-700">No hay solicitudes</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ hayFiltrosActivos ? 'Intenta con otros filtros' : 'Aún no se han registrado trámites' }}
        </p>
        <button
          v-if="hayFiltrosActivos"
          @click="limpiarTodosFiltros"
          class="mt-4 px-4 py-2 rounded-lg bg-dnb-dark text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Paginación -->
      <PaginationControls
        v-if="!cargando && solicitudes && solicitudes.data.length"
        :page="solicitudes.meta.page"
        :limit="solicitudes.meta.limit"
        :total="solicitudes.meta.total"
        @change="cambiarPagina"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import adminService from '../../services/admin.service'
import { useToast } from '../../composables/useToast'
import EstadoBadge from '../../components/admin/EstadoBadge.vue'
import PaginationControls from '../../components/admin/PaginationControls.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const solicitudes = ref(null)
const cargando = ref(true)

const filtros = ref({
  q: route.query.q || '',
  estado: route.query.estado || '',
  modulo: route.query.modulo || '',
  page: parseInt(route.query.page) || 1,
  limit: 20,
})

let debounceTimer = null
function debouncedBuscar() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    filtros.value.page = 1
    aplicarFiltros()
  }, 500)
}

const hayFiltrosActivos = computed(() => {
  return !!(filtros.value.q || filtros.value.estado || filtros.value.modulo)
})

async function cargar() {
  cargando.value = true
  try {
    const params = {
      page: filtros.value.page,
      limit: filtros.value.limit,
    }
    if (filtros.value.q) params.q = filtros.value.q
    if (filtros.value.estado) params.estado = filtros.value.estado
    if (filtros.value.modulo) params.modulo = filtros.value.modulo

    solicitudes.value = await adminService.listarSolicitudes(params)
  } catch (e) {
    console.error('Error cargando solicitudes:', e)
    toast.error('No se pudieron cargar las solicitudes')
    solicitudes.value = null
  } finally {
    cargando.value = false
  }
}

function sincronizarURL() {
  const query = {}
  if (filtros.value.q) query.q = filtros.value.q
  if (filtros.value.estado) query.estado = filtros.value.estado
  if (filtros.value.modulo) query.modulo = filtros.value.modulo
  if (filtros.value.page > 1) query.page = filtros.value.page

  router.replace({ query })
}

function aplicarFiltros() {
  filtros.value.page = 1
  sincronizarURL()
  cargar()
}

function cambiarPagina(nuevaPagina) {
  filtros.value.page = nuevaPagina
  sincronizarURL()
  cargar()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function recargar() {
  cargar()
}

function limpiarBusqueda() {
  filtros.value.q = ''
  aplicarFiltros()
}

function limpiarFiltro(nombre) {
  filtros.value[nombre] = ''
  aplicarFiltros()
}

function limpiarTodosFiltros() {
  filtros.value.q = ''
  filtros.value.estado = ''
  filtros.value.modulo = ''
  filtros.value.page = 1
  sincronizarURL()
  cargar()
}

function formatearEstado(estado) {
  const map = {
    BORRADOR: 'Borrador',
    PENDIENTE_PAGO: 'Pendiente Pago',
    PAGO_CONFIRMADO: 'Pago OK',
    EN_VERIFICACION: 'En Revisión',
    OBSERVADO: 'Observado',
    APROBADO: 'Aprobado',
    INSPECCION: 'Inspección',
    CERTIFICADO_EMITIDO: 'Certificado',
    ANULADO: 'Anulado',
  }
  return map[estado] || estado
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function tiempoRelativo(fecha) {
  if (!fecha) return ''
  const segundos = Math.floor((Date.now() - new Date(fecha)) / 1000)
  if (segundos < 60) return `hace ${segundos}s`
  if (segundos < 3600) return `hace ${Math.floor(segundos / 60)}m`
  if (segundos < 86400) return `hace ${Math.floor(segundos / 3600)}h`
  return `hace ${Math.floor(segundos / 86400)}d`
}

onMounted(() => {
  cargar()
})

watch(
  () => route.query,
  (newQuery) => {
    if (
      newQuery.q !== filtros.value.q ||
      newQuery.estado !== filtros.value.estado ||
      newQuery.modulo !== filtros.value.modulo ||
      parseInt(newQuery.page) !== filtros.value.page
    ) {
      filtros.value.q = newQuery.q || ''
      filtros.value.estado = newQuery.estado || ''
      filtros.value.modulo = newQuery.modulo || ''
      filtros.value.page = parseInt(newQuery.page) || 1
      cargar()
    }
  },
)
</script>