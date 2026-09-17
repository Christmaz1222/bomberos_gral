<template>
  <div class="flex flex-col gap-5">
    <!-- Header -->
    <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded bg-dnb-primary text-white text-[10px] font-bold uppercase tracking-wider">
            Gestión
          </span>
          <span class="text-gray-500 text-xs">• Inspecciones</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Inspecciones</h1>
        <p class="text-sm text-gray-500 mt-1">
          Inspecciones técnicas asignadas
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="cargar"
          :disabled="cargando"
          class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': cargando }">
            refresh
          </span>
          Refrescar
        </button>
      </div>
    </header>

    <!-- Filtros -->
    <div class="bg-white rounded-xl shadow-sm p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Estado
          </label>
          <select
            v-model="filtros.estado"
            @change="cargar"
            class="w-full h-10 px-3 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-dnb-primary/30"
          >
            <option value="">Todos</option>
            <option value="ASIGNADA">Asignadas</option>
            <option value="REALIZADA">Realizadas</option>
            <option value="APROBADA">Aprobadas</option>
            <option value="OBSERVADA">Observadas</option>
            <option value="RECHAZADA">Rechazadas</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-sm p-4">
      <div v-if="cargando" class="space-y-3 animate-pulse">
        <div v-for="i in 5" :key="i" class="h-16 bg-gray-100 rounded-lg"></div>
      </div>

      <div v-else-if="inspecciones?.data?.length" class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider">
              <th class="py-3 px-3 rounded-l-lg">Solicitud</th>
              <th class="py-3 px-3">Módulo</th>
              <th class="py-3 px-3">Inspector</th>
              <th class="py-3 px-3">Fecha asignación</th>
              <th class="py-3 px-3">Estado</th>
              <th class="py-3 px-3 text-right rounded-r-lg">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="ins in inspecciones.data"
              :key="ins.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-3">
                <span class="font-mono font-bold text-gray-900 text-xs">{{ ins.solicitud.codigo }}</span>
              </td>
              <td class="py-3 px-3">
                <span class="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                  {{ ins.solicitud.submodulo?.modulo?.nombre || '—' }}
                </span>
              </td>
              <td class="py-3 px-3">
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-gray-800">{{ ins.inspector.nombre }}</span>
                  <span class="text-[10px] text-gray-500">{{ ins.inspector.email }}</span>
                </div>
              </td>
              <td class="py-3 px-3">
                <span class="text-xs text-gray-600">{{ formatearFecha(ins.fecha_asignacion) }}</span>
              </td>
              <td class="py-3 px-3">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="estadoBadge(ins.estado)"
                >
                  {{ ins.estado }}
                </span>
              </td>
              <td class="py-3 px-3 text-right">
                <RouterLink
                  :to="`/admin/inspecciones/${ins.id}`"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dnb-dark text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
                >
                  <span class="material-symbols-outlined text-[14px]">visibility</span>
                  Ver
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="inspecciones.meta?.totalPages > 1" class="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
          <span class="text-xs text-gray-500">
            Total: {{ inspecciones.meta.total }} · Página {{ inspecciones.meta.page }} de {{ inspecciones.meta.totalPages }}
          </span>
          <div class="flex gap-2">
            <button
              :disabled="pagina <= 1"
              @click="cambiarPagina(pagina - 1)"
              class="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 disabled:opacity-40"
            >Anterior</button>
            <button
              :disabled="pagina >= inspecciones.meta.totalPages"
              @click="cambiarPagina(pagina + 1)"
              class="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 disabled:opacity-40"
            >Siguiente</button>
          </div>
        </div>
      </div>

      <div v-else class="py-12 text-center">
        <span class="material-symbols-outlined text-6xl text-gray-300">search_off</span>
        <p class="mt-3 text-gray-500">No hay inspecciones</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminService from '../../services/admin.service'
import { useToast } from '../../composables/useToast'

const toast = useToast()
const inspecciones = ref(null)
const cargando = ref(true)
const pagina = ref(1)
const filtros = ref({ estado: '' })

async function cargar() {
  cargando.value = true
  try {
    const params = { page: pagina.value }
    if (filtros.value.estado) params.estado = filtros.value.estado
    inspecciones.value = await adminService.listarInspecciones(params)
  } catch (e) {
    console.error(e)
    toast.error('No se pudieron cargar las inspecciones')
  } finally {
    cargando.value = false
  }
}

function cambiarPagina(nueva) {
  pagina.value = nueva
  cargar()
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function estadoBadge(estado) {
  const map = {
    ASIGNADA: 'bg-blue-100 text-blue-700',
    REALIZADA: 'bg-purple-100 text-purple-700',
    APROBADA: 'bg-green-100 text-green-700',
    OBSERVADA: 'bg-orange-100 text-orange-700',
    RECHAZADA: 'bg-red-100 text-red-700',
    CANCELADA: 'bg-gray-100 text-gray-500',
  }
  return map[estado] || 'bg-gray-100 text-gray-500'
}

onMounted(cargar)
</script>