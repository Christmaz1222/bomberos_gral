<script setup>
import { ref, onMounted } from 'vue'
import { usePermisos } from '../../../composables/usePermisos.js'
import { dashboardMockService } from '../../../services/dashboard.mock.service.js'

import SectionTitle from '../../../components/admin/SectionTitle.vue'
import StatCard from '../../../components/admin/StatCard.vue'
import DataTable from '../../../components/admin/DataTable.vue'

// Permiso para acciones de administración
const { esAdmin } = usePermisos()

const cargando = ref(true)
const metricas = ref(null)
const empresas = ref([])

const columnas = [
  { key: 'nit', label: 'NIT' },
  { key: 'razonSocial', label: 'Razón Social' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'representante', label: 'Representante Legal' },
  { key: 'departamento', label: 'Departamento' },
  { key: 'estado', label: 'Estado', align: 'center' },
]

const getEstadoBadgeClass = (estado) => {
  switch (estado) {
    case 'Activa':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    case 'Pendiente':
      return 'bg-amber-50 text-amber-700 border border-amber-100'
    case 'Suspendida':
      return 'bg-red-50 text-red-700 border border-red-100'
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-100'
  }
}

// TODO: conectar exportación de padrón al backend
const exportarPadron = () => {
  console.log('Exportar padrón de empresas (pendiente de conexión backend)')
}

// TODO: conectar registro de nueva empresa al backend (modal / vista formulario)
const registrarNuevaEmpresa = () => {
  console.log('Registrar nueva empresa (pendiente de conexión backend)')
}

// TODO: reemplazar por dashboardService real cuando backend esté listo
onMounted(async () => {
  try {
    const [resMetricas, resEmpresas] = await Promise.all([
      dashboardMockService.getMetricasEmpresas(),
      dashboardMockService.getEmpresas(),
    ])
    metricas.value = resMetricas
    empresas.value = resEmpresas
  } catch (error) {
    console.error('Error al cargar datos de empresas:', error)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 1. Título de sección y Botones de Acción (Admin) -->
    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <SectionTitle
        :breadcrumb="['Admin', 'Usuarios', 'Empresas']"
        titulo="Gestión de Empresas"
        subtitulo="Administración y estado normativo de personas jurídicas registradas"
      />

      <!-- Botones de Acción exclusivos para ADMIN -->
      <div v-if="esAdmin" class="flex items-center gap-3 self-start md:self-auto shrink-0 pt-2 md:pt-0">
        <button
          @click="exportarPadron"
          type="button"
          class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span class="material-symbols-outlined text-[18px]">file_download</span>
          Exportar Padrón
        </button>

        <button
          @click="registrarNuevaEmpresa"
          type="button"
          class="bg-bomberos-red hover:bg-bomberos-red/90 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span class="material-symbols-outlined text-[18px]">add_business</span>
          Registrar Nueva Empresa
        </button>
      </div>
    </div>

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
          titulo="Empresas Registradas"
          :valor="metricas.registradas"
          subtitulo="+6 este mes"
          icono="business"
          colorIcono="text-blue-600"
          colorFondoIcono="bg-blue-50"
        />

        <StatCard
          titulo="Activas"
          :valor="metricas.activas"
          subtitulo="82.7% vigentes"
          icono="check_circle"
          colorIcono="text-emerald-600"
          colorFondoIcono="bg-emerald-50"
        />

        <StatCard
          titulo="Pendientes"
          :valor="metricas.pendientes"
          subtitulo="Mesa de partes"
          icono="pending"
          colorIcono="text-amber-600"
          colorFondoIcono="bg-amber-50"
        />

        <StatCard
          titulo="Suspendidas"
          :valor="metricas.suspendidas"
          subtitulo="Riesgo normativo"
          icono="block"
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
              Padrón General de Personas Jurídicas
            </h2>
            <p class="text-xs text-on-surface-variant mt-0.5">
              Empresas sujetas a control y certificación de prevención
            </p>
          </div>
          <div class="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 self-start">
            Total: {{ empresas.length }} empresas
          </div>
        </div>

        <DataTable
          :columnas="columnas"
          :filas="empresas"
          :loading="cargando"
          emptyMessage="No hay empresas registradas"
        >
          <!-- Slot NIT -->
          <template #cell-nit="{ value }">
            <span class="font-bold text-slate-900 font-mono text-xs">{{ value }}</span>
          </template>

          <!-- Slot Razón Social -->
          <template #cell-razonSocial="{ value }">
            <span class="font-semibold text-slate-800">{{ value }}</span>
          </template>

          <!-- Slot Tipo (S.A. / S.R.L.) -->
          <template #cell-tipo="{ value }">
            <span class="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200/60">
              {{ value }}
            </span>
          </template>

          <!-- Slot Representante -->
          <template #cell-representante="{ value }">
            <span class="text-slate-600 text-xs">{{ value }}</span>
          </template>

          <!-- Slot Departamento -->
          <template #cell-departamento="{ value }">
            <span class="text-slate-600 text-xs">{{ value }}</span>
          </template>

          <!-- Slot Estado -->
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
