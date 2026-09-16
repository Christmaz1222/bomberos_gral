<script setup>
import { ref, onMounted } from 'vue'
import { usePermisos } from '../../../composables/usePermisos.js'
import { dashboardMockService } from '../../../services/dashboard.mock.service.js'

import SectionTitle from '../../../components/admin/SectionTitle.vue'
import StatCard from '../../../components/admin/StatCard.vue'
import ModuleProgressBar from '../../../components/admin/ModuleProgressBar.vue'
import DataTable from '../../../components/admin/DataTable.vue'

// Permisos para personalización por rol (Capacitor no ve tabla de solicitudes)
const { puedeAccionarPanelPrincipal } = usePermisos()

// Estados reactivos
const cargando = ref(true)
const metricas = ref(null)
const distribucionModulos = ref([])
const ultimasCarpetas = ref([])

// Definición de columnas para la tabla de carpetas
const columnasCarpetas = [
  { key: 'nroTramite', label: 'Nro. Trámite' },
  { key: 'contribuyente', label: 'Contribuyente/Empresa' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'modulo', label: 'Módulo' },
  { key: 'sector', label: 'Sector' },
  { key: 'ingreso', label: 'Ingreso' },
  { key: 'prioridad', label: 'Prioridad', align: 'center' },
  { key: 'estado', label: 'Estado', align: 'right' },
]

// Helpers de estilos para badges
const getPrioridadBadgeClass = (prioridad) => {
  switch (prioridad) {
    case 'Alta':
      return 'bg-red-50 text-red-700 font-bold border border-red-100'
    case 'Media':
      return 'bg-amber-50 text-amber-700 font-medium border border-amber-100'
    case 'Baja':
      return 'bg-slate-50 text-slate-600 font-medium border border-slate-100'
    default:
      return 'bg-slate-50 text-slate-600 font-medium'
  }
}

const getEstadoBadgeClass = (estado) => {
  switch (estado) {
    case 'Aprobado':
      return 'text-emerald-700 bg-emerald-50 border border-emerald-100'
    case 'Pendiente':
      return 'text-amber-700 bg-amber-50 border border-amber-100'
    case 'Observado':
      return 'text-red-700 bg-red-50 border border-red-100'
    default:
      return 'text-slate-600 bg-slate-50 border border-slate-100'
  }
}

// TODO: reemplazar por dashboardService real cuando backend esté listo
onMounted(async () => {
  try {
    const [resMetricas, resDistribucion, resCarpetas] = await Promise.all([
      dashboardMockService.getMetricas(),
      dashboardMockService.getDistribucionModulos(),
      dashboardMockService.getUltimasCarpetas(),
    ])

    metricas.value = resMetricas
    distribucionModulos.value = resDistribucion
    ultimasCarpetas.value = resCarpetas
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 1. Título de sección -->
    <SectionTitle
      :breadcrumb="['Admin', 'Panel Principal']"
      titulo="Panel de Control — Dirección Nacional de Bomberos"
      subtitulo="Visión global de los 3 módulos operativos del sistema SIPPCI"
    />

    <!-- Estado de carga general (Skeleton inicial) -->
    <div v-if="cargando" class="space-y-6 animate-pulse">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-32 bg-white rounded-xl shadow-sm p-4"></div>
      </div>
      <div class="h-48 bg-white rounded-xl shadow-sm p-6"></div>
      <div v-if="puedeAccionarPanelPrincipal" class="h-64 bg-white rounded-xl shadow-sm p-6"></div>
    </div>

    <!-- Contenido cuando ya cargó -->
    <template v-else>
      <!-- 2. Grid de 4 StatCards -->
      <div v-if="metricas" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          titulo="Trámites Totales"
          :valor="metricas.tramitesTotales.valor"
          :subtitulo="metricas.tramitesTotales.cambio"
          icono="folder_open"
          colorIcono="text-blue-600"
          colorFondoIcono="bg-blue-50"
        />

        <StatCard
          titulo="En Inspección"
          :valor="metricas.enInspeccion.valor"
          :subtitulo="metricas.enInspeccion.cambio"
          icono="pending_actions"
          colorIcono="text-amber-600"
          colorFondoIcono="bg-amber-50"
        />

        <StatCard
          titulo="Aprobados"
          :valor="metricas.aprobados.valor"
          :subtitulo="metricas.aprobados.cambio"
          icono="task_alt"
          colorIcono="text-emerald-600"
          colorFondoIcono="bg-emerald-50"
        />

        <StatCard
          titulo="Observados"
          :valor="metricas.observados.valor"
          :subtitulo="metricas.observados.cambio"
          icono="warning"
          colorIcono="text-bomberos-red"
          colorFondoIcono="bg-red-50"
          colorValor="text-bomberos-red"
          colorSubtitulo="text-bomberos-red"
        />
      </div>

      <!-- 3. Distribución de Trámites por Módulo -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <h2 class="font-title-md text-title-md text-bomberos-navy font-bold mb-4">
          Distribución de Trámites por Módulo
        </h2>
        <div class="space-y-4">
          <ModuleProgressBar
            v-for="item in distribucionModulos"
            :key="item.nombre"
            :nombre="item.nombre"
            :tramites="item.tramites"
            :porcentaje="item.porcentaje"
            :color="'bg-' + item.color"
          />
        </div>
      </div>

      <!-- 4. Últimas Carpetas Ingresadas (Oculto para rol CAPACITOR via puedeAccionarPanelPrincipal) -->
      <div v-if="puedeAccionarPanelPrincipal" class="bg-white rounded-xl shadow-sm p-6 border border-slate-100 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 class="font-title-md text-title-md text-bomberos-navy font-bold">
              Últimas Carpetas Ingresadas
            </h2>
            <p class="text-xs text-on-surface-variant mt-0.5">
              Monitoreo en tiempo real de los 3 módulos operativos
            </p>
          </div>
          <span class="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 self-start">
            Actualización automática
          </span>
        </div>

        <DataTable
          :columnas="columnasCarpetas"
          :filas="ultimasCarpetas"
          :loading="cargando"
          emptyMessage="No se encontraron carpetas recientes"
        >
          <!-- Slot nroTramite -->
          <template #cell-nroTramite="{ value }">
            <span class="font-bold text-slate-900 font-mono text-xs">{{ value }}</span>
          </template>

          <!-- Slot contribuyente -->
          <template #cell-contribuyente="{ value }">
            <span class="font-medium text-slate-800">{{ value }}</span>
          </template>

          <!-- Slot tipo -->
          <template #cell-tipo="{ value }">
            <span
              :class="[
                'px-2 py-0.5 rounded text-[11px] font-semibold',
                value === 'Jurídica' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700',
              ]"
            >
              {{ value }}
            </span>
          </template>

          <!-- Slot modulo -->
          <template #cell-modulo="{ value }">
            <span
              :class="[
                'px-2 py-0.5 rounded text-[11px] font-semibold',
                value === 'SIPPCI' ? 'bg-blue-50 text-bomberos-navy' : '',
                value === 'Reglamentación' ? 'bg-red-50 text-bomberos-red' : '',
                value === 'Turismo' ? 'bg-amber-50 text-amber-700' : '',
              ]"
            >
              {{ value }}
            </span>
          </template>

          <!-- Slot sector -->
          <template #cell-sector="{ value }">
            <span class="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-600">
              {{ value }}
            </span>
          </template>

          <!-- Slot ingreso -->
          <template #cell-ingreso="{ value }">
            <span class="text-xs text-slate-500">{{ value }}</span>
          </template>

          <!-- Slot prioridad -->
          <template #cell-prioridad="{ value }">
            <span :class="['px-2.5 py-0.5 rounded-full text-[11px]', getPrioridadBadgeClass(value)]">
              {{ value }}
            </span>
          </template>

          <!-- Slot estado -->
          <template #cell-estado="{ value }">
            <span :class="['px-2.5 py-0.5 rounded-full text-[11px] font-bold', getEstadoBadgeClass(value)]">
              {{ value }}
            </span>
          </template>
        </DataTable>
      </div>
    </template>
  </div>
</template>
