<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { dashboardMockService } from '../../../services/dashboard.mock.service.js'

import SectionTitle from '../../../components/admin/SectionTitle.vue'
import StatCard from '../../../components/admin/StatCard.vue'
import DataTable from '../../../components/admin/DataTable.vue'

const router = useRouter()
const route = useRoute()

const cargando = ref(true)
const metricas = ref(null)
const profesionales = ref([])

// Filtro opcional reactivo por tipo (Natural / Jurídica) via query params
const profesionalesFiltrados = computed(() => {
  const tipo = route.query.tipo
  if (!tipo) return profesionales.value
  return profesionales.value.filter((p) => p.tipo.toLowerCase() === tipo.toLowerCase())
})

const columnas = [
  { key: 'codigo', label: 'Código' },
  { key: 'solicitante', label: 'Solicitante' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'ci', label: 'CI / NIT' },
  { key: 'departamento', label: 'Departamento' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'estado', label: 'Estado', align: 'center' },
  { key: 'acciones', label: 'Acciones', align: 'right' },
]

const getTipoBadgeClass = (tipo) => {
  switch (tipo) {
    case 'Natural':
      return 'bg-blue-50 text-blue-700 border border-blue-100'
    case 'Jurídica':
      return 'bg-purple-50 text-purple-700 border border-purple-100'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const getEstadoBadgeClass = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return 'bg-amber-50 text-amber-700 border border-amber-100'
    case 'En Revisión':
      return 'bg-blue-50 text-blue-700 border border-blue-100'
    case 'Aprobado':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    case 'Observado':
      return 'bg-red-50 text-red-700 border border-red-100'
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-100'
  }
}

const verDetalle = (fila) => {
  // Redirige o abre detalle del expediente profesional
  router.push({
    path: '/admin/solicitudes/sippci/profesionales',
    query: { expediente: fila.codigo },
  })
}

// TODO: reemplazar por dashboardService real cuando backend esté listo
onMounted(async () => {
  try {
    const [resMetricas, resProfesionales] = await Promise.all([
      dashboardMockService.getMetricasProfesionales(),
      dashboardMockService.getProfesionales(),
    ])
    metricas.value = resMetricas
    profesionales.value = resProfesionales
  } catch (error) {
    console.error('Error al cargar datos de profesionales:', error)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 1. Título de sección -->
    <SectionTitle
      :breadcrumb="['Admin', 'Solicitudes', 'SIPPCI', 'Registro de Profesionales']"
      titulo="Registro de Profesionales"
      subtitulo="Gestión de solicitudes de registro profesional SIPPCI"
    />

    <!-- Skeleton durante carga -->
    <div v-if="cargando" class="space-y-6 animate-pulse">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-32 bg-white rounded-xl shadow-sm p-4"></div>
      </div>
      <div class="h-64 bg-white rounded-xl shadow-sm p-6"></div>
    </div>

    <!-- Contenido cuando ya cargó -->
    <template v-else>
      <!-- 2. Grid de 4 StatCards -->
      <div v-if="metricas" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          titulo="Pendientes"
          :valor="metricas.pendientes"
          icono="pending_actions"
          colorIcono="text-amber-600"
          colorFondoIcono="bg-amber-50"
        />

        <StatCard
          titulo="En Revisión"
          :valor="metricas.enRevision"
          icono="rate_review"
          colorIcono="text-blue-600"
          colorFondoIcono="bg-blue-50"
        />

        <StatCard
          titulo="Aprobadas"
          :valor="metricas.aprobadas"
          icono="task_alt"
          colorIcono="text-emerald-600"
          colorFondoIcono="bg-emerald-50"
        />

        <StatCard
          titulo="Observadas"
          :valor="metricas.observadas"
          icono="warning"
          colorIcono="text-bomberos-red"
          colorFondoIcono="bg-red-50"
          colorValor="text-bomberos-red"
          colorSubtitulo="text-bomberos-red"
        />
      </div>

      <!-- 3. Card con DataTable -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-100 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 class="font-title-md text-title-md text-bomberos-navy font-bold">
              Listado de Profesionales Registrados
            </h2>
            <p class="text-xs text-on-surface-variant mt-0.5">
              Expedientes de postulantes naturales y empresas acreditadas
            </p>
          </div>
          <div class="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 self-start">
            Total: {{ profesionalesFiltrados.length }} solicitudes
          </div>
        </div>

        <DataTable
          :columnas="columnas"
          :filas="profesionalesFiltrados"
          :loading="cargando"
          emptyMessage="No hay profesionales registrados"
        >
          <!-- Slot codigo -->
          <template #cell-codigo="{ value }">
            <span class="font-bold text-slate-900 font-mono text-xs">{{ value }}</span>
          </template>

          <!-- Slot solicitante -->
          <template #cell-solicitante="{ value }">
            <span class="font-medium text-slate-800">{{ value }}</span>
          </template>

          <!-- Slot tipo con badge diferenciado -->
          <template #cell-tipo="{ value }">
            <span :class="['px-2.5 py-0.5 rounded text-[11px] font-semibold', getTipoBadgeClass(value)]">
              {{ value }}
            </span>
          </template>

          <!-- Slot CI / NIT -->
          <template #cell-ci="{ value }">
            <span class="font-mono text-xs text-slate-600">{{ value }}</span>
          </template>

          <!-- Slot departamento -->
          <template #cell-departamento="{ value }">
            <span class="text-slate-600 text-xs">{{ value }}</span>
          </template>

          <!-- Slot fecha -->
          <template #cell-fecha="{ value }">
            <span class="text-xs text-slate-500">{{ value }}</span>
          </template>

          <!-- Slot estado con badge diferenciado -->
          <template #cell-estado="{ value }">
            <span :class="['px-2.5 py-0.5 rounded-full text-[11px] font-bold', getEstadoBadgeClass(value)]">
              {{ value }}
            </span>
          </template>

          <!-- Slot acciones con botón de ojo -->
          <template #cell-acciones="{ fila }">
            <button
              @click="verDetalle(fila)"
              title="Ver expediente"
              class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-bomberos-navy transition-colors inline-flex items-center justify-center cursor-pointer"
            >
              <span class="material-symbols-outlined text-[20px]">visibility</span>
            </button>
          </template>
        </DataTable>
      </div>
    </template>
  </div>
</template>
