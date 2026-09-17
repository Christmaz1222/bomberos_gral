<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
        <RouterLink
          to="/mis-solicitudes"
          class="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </RouterLink>
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-gray-900">Detalle de Solicitud</h1>
          <p class="text-xs text-gray-500 font-mono truncate">{{ codigo }}</p>
        </div>
        <button
          v-if="solicitud"
          @click="descargarComprobante"
          :disabled="descargandoComprobante"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <span
            class="material-symbols-outlined text-[16px]"
            :class="{ 'animate-spin': descargandoComprobante }"
          >
            {{ descargandoComprobante ? 'progress_activity' : 'download' }}
          </span>
          Comprobante
        </button>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6">
      <!-- Skeleton -->
      <div v-if="cargando" class="space-y-4 animate-pulse">
        <div class="h-32 bg-gray-100 rounded-xl"></div>
        <div class="h-64 bg-gray-100 rounded-xl"></div>
      </div>

      <!-- 404 -->
      <div v-else-if="!solicitud" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <span class="material-symbols-outlined text-6xl text-gray-300">search_off</span>
        <h2 class="mt-3 text-lg font-bold text-gray-700">Solicitud no encontrada</h2>
        <p class="mt-1 text-sm text-gray-500">
          La solicitud <span class="font-mono font-semibold">{{ codigo }}</span> no existe o no tienes acceso.
        </p>
        <RouterLink
          to="/mis-solicitudes"
          class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver
        </RouterLink>
      </div>

      <!-- Detalle -->
      <div v-else class="space-y-4">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  {{ solicitud.submodulo?.modulo?.nombre || solicitud.modulo }}
                </span>
                <EstadoBadge :estado="solicitud.estado" />
              </div>
              <h1 class="text-2xl font-bold text-gray-900 font-mono">{{ solicitud.codigo }}</h1>
              <p class="text-sm text-gray-500 mt-1">{{ solicitud.submodulo?.nombre || solicitud.submodulo }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Fecha</p>
              <p class="text-sm font-semibold text-gray-800">
                {{ formatearFechaHora(solicitud.fecha_solicitud) }}
              </p>
            </div>
          </div>

          <!-- Observación -->
          <div
            v-if="solicitud.observacion"
            class="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded"
          >
            <div class="flex gap-2">
              <span class="material-symbols-outlined text-yellow-600 text-[18px]">info</span>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-yellow-700">Observación</p>
                <p class="text-sm text-gray-700 mt-0.5">{{ solicitud.observacion }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            Historial
          </h2>
          <div v-if="solicitud.historial?.length" class="relative">
            <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
            <div class="flex flex-col gap-4">
              <div
                v-for="(h, i) in solicitud.historial"
                :key="h.id"
                class="relative pl-10"
              >
                <div
                  class="absolute left-0 top-1 w-7 h-7 rounded-full flex items-center justify-center z-10"
                  :class="i === solicitud.historial.length - 1 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'"
                >
                  <span class="material-symbols-outlined text-[14px]">
                    {{ i === 0 ? 'flag' : 'check' }}
                  </span>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span v-if="h.estado_anterior" class="text-xs text-gray-400 font-mono">
                    {{ formatearEstado(h.estado_anterior) }}
                  </span>
                  <span v-if="h.estado_anterior" class="material-symbols-outlined text-[14px] text-gray-300">
                    arrow_forward
                  </span>
                  <EstadoBadge :estado="h.estado_nuevo" />
                </div>
                <p v-if="h.observacion" class="text-xs text-gray-600 mt-1">{{ h.observacion }}</p>
                <p class="text-[10px] text-gray-400 mt-0.5">{{ formatearFechaHora(h.created_at) }}</p>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 text-center py-4">
            Sin transiciones registradas
          </p>
        </div>

        <!-- Documentos + Pago -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white rounded-xl shadow-sm p-5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Documentos
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                {{ solicitud.documentos?.length || 0 }}
              </span>
            </div>
            <div v-if="solicitud.documentos?.length" class="flex flex-col gap-2">
              <div
                v-for="doc in solicitud.documentos"
                :key="doc.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <span class="material-symbols-outlined text-red-500">picture_as_pdf</span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-800 truncate">
                    {{ doc.nombre_original }}
                  </p>
                  <p class="text-[10px] text-gray-500">{{ doc.tipo_documento }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-xs text-gray-500 text-center py-4">
              Sin documentos cargados
            </p>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-5">
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Pago
            </h2>
            <div v-if="solicitud.pagos?.length">
              <div v-for="pago in solicitud.pagos" :key="pago.id" class="flex flex-col gap-2">
                <span
                  class="inline-flex px-2 py-1 rounded-full text-xs font-bold self-start"
                  :class="
                    pago.estado === 'PAGADO' || pago.estado === 'CONFIRMADO'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  "
                >
                  {{ pago.estado }}
                </span>
                <p class="text-sm font-bold text-gray-900">{{ pago.monto_bs }} Bs</p>
                <p class="text-[10px] text-gray-500 font-mono">{{ pago.codigo_orden }}</p>
              </div>
            </div>
            <p v-else class="text-xs text-gray-500 text-center py-4">
              Sin pago registrado
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../../config/api'
import { useToast } from '../../composables/useToast'
import EstadoBadge from '../../components/admin/EstadoBadge.vue'

const route = useRoute()
const toast = useToast()
const solicitud = ref(null)
const cargando = ref(true)
const descargandoComprobante = ref(false)

async function descargarComprobante() {
  descargandoComprobante.value = true
  try {
    const response = await apiClient.get(
      `/solicitudes/${codigo.value}/comprobante`,
      { responseType: 'blob' },
    )

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comprobante-${codigo.value}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('Comprobante descargado')
  } catch (e) {
    console.error('Error descargando comprobante:', e)
    toast.error('No se pudo descargar el comprobante')
  } finally {
    descargandoComprobante.value = false
  }
}

const codigo = computed(() => route.params.codigo)

async function cargar() {
  cargando.value = true
  try {
    const { data } = await apiClient.get(`/solicitudes/${codigo.value}`)
    solicitud.value = data
  } catch (e) {
    console.error('Error cargando solicitud:', e)
    solicitud.value = null
  } finally {
    cargando.value = false
  }
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

function formatearFechaHora(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  cargar()
})
</script>
