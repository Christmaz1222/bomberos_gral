<template>
  <div class="flex flex-col gap-6">
    <!-- Encabezado -->
    <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex flex-col">
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded bg-dnb-primary text-white text-[10px] font-bold uppercase tracking-wider">
            Mando Operativo
          </span>
          <span class="text-gray-500 text-xs">• SIPPCI V2.0 Nacional</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
          Sistema Control de Prevención
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Monitoreo, fiscalización y asignación de inspecciones técnicas de seguridad contra incendios.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center bg-white rounded-lg shadow-sm px-3 py-2 gap-2">
          <span class="material-symbols-outlined text-gray-400 text-[18px]">event</span>
          <span class="text-sm font-semibold text-gray-800">Hoy: {{ fechaHoy }}</span>
        </div>
        <button
          v-if="ultimaActualizacion"
          class="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          :title="`Última actualización: ${ultimaActualizacion}`"
        >
          Actualizado {{ tiempoDesdeActualizacion }}
        </button>
      </div>
    </header>

    <!-- 6 KPIs -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <template v-if="cargandoStats">
        <div v-for="i in 6" :key="i" class="bg-white rounded-xl p-4 shadow-sm animate-pulse">
          <div class="flex items-start justify-between">
            <div class="h-3 w-20 bg-gray-200 rounded"></div>
            <div class="w-8 h-8 rounded-lg bg-gray-200"></div>
          </div>
          <div class="mt-3 h-8 w-16 bg-gray-200 rounded"></div>
          <div class="mt-2 h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </template>
      <template v-else-if="stats">
        <KpiCard
          label="Pendientes"
          :value="stats.kpis.pendientes.valor"
          icon="local_fire_department"
          color="error"
          :badge="stats.kpis.pendientes.badge"
          :pulsing="stats.kpis.pendientes.valor > 0"
        />
        <KpiCard
          label="En Revisión"
          :value="stats.kpis.enRevision.valor"
          icon="engineering"
          color="info"
          :badge="stats.kpis.enRevision.badge"
        />
        <KpiCard
          label="Observados"
          :value="stats.kpis.observados.valor"
          icon="report_problem"
          color="error"
          :badge="stats.kpis.observados.badge"
        />
        <KpiCard
          label="Renovaciones"
          :value="stats.kpis.renovaciones.valor"
          icon="update"
          color="warning"
          :badge="stats.kpis.renovaciones.badge"
        />
        <KpiCard
          label="Cursos Activos"
          :value="stats.kpis.cursos.valor"
          icon="school"
          color="success"
          :badge="stats.kpis.cursos.badge"
        />
        <KpiCard
          label="Certificados"
          :value="stats.kpis.certificados.valor"
          icon="verified"
          color="primary"
          :badge="stats.kpis.certificados.badge"
        />
      </template>
      <template v-else>
        <div v-for="i in 6" :key="i" class="bg-white rounded-xl p-4 shadow-sm text-center">
          <span class="material-symbols-outlined text-3xl text-gray-300">error</span>
          <p class="text-xs text-gray-500 mt-2">Sin datos</p>
        </div>
      </template>
    </section>

    <!-- Contenido dual -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Bandeja -->
      <section class="lg:col-span-8 flex flex-col gap-4">
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 class="text-lg font-bold text-gray-900">Bandeja Operativa</h2>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">
                {{ solicitudes?.meta.total || 0 }} activas
              </span>
              <span
                v-if="cargandoSolicitudes"
                class="material-symbols-outlined text-[16px] text-gray-400 animate-spin"
              >
                progress_activity
              </span>
            </div>
          </div>

          <!-- Skeleton tabla -->
          <div v-if="cargandoSolicitudes" class="mt-4 space-y-3 animate-pulse">
            <div v-for="i in 3" :key="i" class="h-12 bg-gray-100 rounded"></div>
          </div>

          <!-- Tabla real -->
          <div v-else-if="solicitudes?.data.length" class="mt-4 overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider">
                  <th class="py-2 px-3 rounded-l-lg">Código</th>
                  <th class="py-2 px-3">Módulo</th>
                  <th class="py-2 px-3">Solicitante</th>
                  <th class="py-2 px-3">Estado</th>
                  <th class="py-2 px-3 text-right rounded-r-lg">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="s in solicitudes.data"
                  :key="s.codigo"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-3">
                    <span class="font-mono font-bold text-gray-900">{{ s.codigo }}</span>
                  </td>
                  <td class="py-3 px-3">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                      {{ s.modulo }}
                    </span>
                  </td>
                  <td class="py-3 px-3">
                    <div class="flex flex-col">
                      <span class="font-semibold text-gray-900">
                        {{ s.empresa?.razon_social || s.solicitante?.nombre || '—' }}
                      </span>
                      <span class="text-[10px] text-gray-500 font-mono">
                        {{ s.empresa?.nit ? `NIT: ${s.empresa.nit}` : `CI: ${s.solicitante?.ci || '—'}` }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 px-3">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      :class="estadoBadge(s.estado)"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                      {{ formatearEstado(s.estado) }}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-right">
                    <div class="inline-flex items-center gap-1">
                      <RouterLink
                        :to="`/admin/solicitudes/${s.codigo}`"
                        class="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                        title="Ver detalle"
                      >
                        <span class="material-symbols-outlined text-[18px]">folder_open</span>
                      </RouterLink>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Sin datos -->
          <div v-else class="mt-6 py-12 text-center">
            <span class="material-symbols-outlined text-6xl text-gray-300">inbox</span>
            <p class="mt-3 text-gray-500 text-sm">No hay solicitudes registradas</p>
            <p class="mt-1 text-gray-400 text-xs">Crea la primera solicitud para ver datos</p>
          </div>

          <div v-if="solicitudes?.data.length" class="mt-4 flex items-center justify-between text-xs">
            <span class="text-gray-500">
              Mostrando {{ solicitudes.data.length }} de {{ solicitudes.meta.total }} expedientes
            </span>
            <RouterLink
              to="/admin/solicitudes"
              class="text-dnb-primary font-semibold hover:underline"
            >
              Ver todos →
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Lateral -->
      <aside class="lg:col-span-4 flex flex-col gap-4">
        <!-- Alertas -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-dnb-primary text-[20px]">notifications_active</span>
              <h2 class="text-sm font-bold text-gray-900">Alertas Críticas</h2>
            </div>
            <span
              v-if="alertas?.data.length"
              class="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold"
            >
              {{ alertas.meta.noLeidas }} ACTIVAS
            </span>
          </div>

          <div v-if="cargandoAlertas" class="space-y-2 animate-pulse">
            <div v-for="i in 2" :key="i" class="h-16 bg-gray-100 rounded-lg"></div>
          </div>

          <div v-else-if="alertas?.data.length" class="flex flex-col gap-2">
            <div
              v-for="alerta in alertas.data.slice(0, 3)"
              :key="alerta.id"
              class="p-3 rounded-lg"
              :class="alerta.prioridad === 'CRITICA' ? 'bg-red-50' : 'bg-gray-50'"
            >
              <div class="flex items-start justify-between mb-1">
                <span
                  class="text-[10px] font-bold uppercase tracking-wider"
                  :class="alerta.prioridad === 'CRITICA' ? 'text-red-700' : 'text-gray-600'"
                >
                  {{ alerta.tipo }}
                </span>
                <span class="text-[10px] text-gray-500">{{ tiempoRelativo(alerta.created_at) }}</span>
              </div>
              <p class="text-xs text-gray-700">{{ alerta.titulo }}</p>
              <p class="text-[10px] text-gray-500 mt-1">{{ alerta.mensaje }}</p>
            </div>
          </div>

          <div v-else class="py-6 text-center">
            <span class="material-symbols-outlined text-4xl text-gray-300">check_circle</span>
            <p class="text-xs text-gray-500 mt-2">Sin alertas</p>
          </div>
        </div>

        <!-- Guardia -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-gray-500 text-[20px]">badge</span>
              <h2 class="text-sm font-bold text-gray-900">Turno de Guardia</h2>
            </div>
            <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>

          <div v-if="cargandoGuardia" class="space-y-3 animate-pulse">
            <div v-for="i in 3" :key="i" class="h-4 bg-gray-100 rounded"></div>
          </div>

          <div v-else-if="guardia" class="flex flex-col gap-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-500 text-xs">Oficial de Guardia</span>
              <span class="font-semibold text-gray-900">{{ guardia.oficial }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500 text-xs">Estaciones</span>
              <span class="font-bold text-gray-900">
                {{ guardia.estacionesConectadas }} / {{ guardia.estacionesTotal }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <span class="text-gray-500 text-xs">Tiempo Promedio</span>
                <span class="font-bold text-gray-900">{{ guardia.tiempoPromedioHoras }} hrs</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  class="bg-dnb-primary h-full rounded-full"
                  :style="{ width: `${(guardia.tiempoPromedioHoras / guardia.metaHoras) * 100}%` }"
                ></div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500 text-xs">Inspectores Hoy</span>
              <span class="font-semibold text-gray-900">{{ guardia.inspectoresHabilitados }} Oficiales</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import KpiCard from '../../components/admin/KpiCard.vue'
import adminService from '../../services/admin.service'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const stats = ref(null)
const solicitudes = ref(null)
const alertas = ref(null)
const guardia = ref(null)

const cargandoStats = ref(true)
const cargandoSolicitudes = ref(true)
const cargandoAlertas = ref(true)
const cargandoGuardia = ref(true)

const ultimaActualizacion = ref(null)

const fechaHoy = computed(() => {
  return new Date().toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})

const tiempoDesdeActualizacion = computed(() => {
  if (!ultimaActualizacion.value) return ''
  const segundos = Math.floor((Date.now() - new Date(ultimaActualizacion.value)) / 1000)
  if (segundos < 60) return `hace ${segundos}s`
  if (segundos < 3600) return `hace ${Math.floor(segundos / 60)}m`
  return `hace ${Math.floor(segundos / 3600)}h`
})

async function cargarTodo() {
  await Promise.all([
    cargarStats(),
    cargarSolicitudes(),
    cargarAlertas(),
    cargarGuardia(),
  ])
  ultimaActualizacion.value = new Date().toISOString()
}

async function cargarStats() {
  cargandoStats.value = true
  try {
    stats.value = await adminService.obtenerStats()
  } catch (e) {
    console.error('Error stats:', e)
    toast.error('No se pudieron cargar las estadísticas')
    stats.value = null
  } finally {
    cargandoStats.value = false
  }
}

async function cargarSolicitudes() {
  cargandoSolicitudes.value = true
  try {
    solicitudes.value = await adminService.listarSolicitudes({ page: 1, limit: 5 })
  } catch (e) {
    console.error('Error solicitudes:', e)
    toast.error('No se pudieron cargar las solicitudes')
    solicitudes.value = null
  } finally {
    cargandoSolicitudes.value = false
  }
}

async function cargarAlertas() {
  cargandoAlertas.value = true
  try {
    alertas.value = await adminService.listarAlertas(false)
  } catch (e) {
    console.error('Error alertas:', e)
    alertas.value = null
  } finally {
    cargandoAlertas.value = false
  }
}

async function cargarGuardia() {
  cargandoGuardia.value = true
  try {
    guardia.value = await adminService.obtenerGuardia()
  } catch (e) {
    console.error('Error guardia:', e)
    guardia.value = null
  } finally {
    cargandoGuardia.value = false
  }
}

onMounted(() => {
  cargarTodo()
})

defineExpose({ cargarTodo })

function estadoBadge(estado) {
  const map = {
    BORRADOR: 'bg-gray-100 text-gray-700',
    PENDIENTE_PAGO: 'bg-orange-100 text-orange-700',
    PAGO_CONFIRMADO: 'bg-blue-100 text-blue-700',
    EN_VERIFICACION: 'bg-blue-100 text-blue-700',
    OBSERVADO: 'bg-red-100 text-red-700',
    APROBADO: 'bg-green-100 text-green-700',
    INSPECCION: 'bg-purple-100 text-purple-700',
    CERTIFICADO_EMITIDO: 'bg-emerald-100 text-emerald-700',
    ANULADO: 'bg-gray-200 text-gray-600',
  }
  return map[estado] || 'bg-gray-100 text-gray-700'
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

function tiempoRelativo(fecha) {
  if (!fecha) return ''
  const segundos = Math.floor((Date.now() - new Date(fecha)) / 1000)
  if (segundos < 60) return `hace ${segundos}s`
  if (segundos < 3600) return `hace ${Math.floor(segundos / 60)}m`
  if (segundos < 86400) return `hace ${Math.floor(segundos / 3600)}h`
  return `hace ${Math.floor(segundos / 86400)}d`
}
</script>