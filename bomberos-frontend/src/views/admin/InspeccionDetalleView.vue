<template>
  <div class="flex flex-col gap-5">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm">
      <RouterLink to="/admin/inspecciones" class="text-gray-500 hover:text-dnb-primary">
        Inspecciones
      </RouterLink>
      <span class="material-symbols-outlined text-[16px] text-gray-300">chevron_right</span>
      <span class="text-gray-900 font-semibold">Detalle</span>
    </nav>

    <!-- Skeleton -->
    <div v-if="cargando" class="space-y-4 animate-pulse">
      <div class="h-32 bg-gray-100 rounded-xl"></div>
      <div class="h-64 bg-gray-100 rounded-xl"></div>
    </div>

    <!-- Detalle -->
    <template v-else-if="inspeccion">
      <!-- Header -->
      <header class="bg-white rounded-xl shadow-sm p-5">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="px-2 py-0.5 rounded bg-dnb-primary text-white text-[10px] font-bold uppercase tracking-wider">
                {{ inspeccion.solicitud.submodulo?.modulo?.nombre || 'Módulo' }}
              </span>
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="estadoBadge(inspeccion.estado)"
              >
                {{ inspeccion.estado }}
              </span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 font-mono">
              {{ inspeccion.solicitud.codigo }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">{{ inspeccion.solicitud.submodulo?.nombre }}</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Inspector</p>
            <p class="text-sm font-semibold text-gray-800">{{ inspeccion.inspector.nombre }}</p>
            <p class="text-xs text-gray-500">{{ inspeccion.inspector.email }}</p>
          </div>
        </div>
      </header>

      <!-- Datos del solicitante -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Solicitante</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Nombre</p>
            <p class="text-sm font-semibold text-gray-800">
              {{ inspeccion.solicitud.usuario?.nombre_completo || inspeccion.solicitud.empresa?.razon_social || '—' }}
            </p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Tipo</p>
            <p class="text-sm font-semibold text-gray-800">{{ inspeccion.solicitud.tipo_persona }}</p>
          </div>
        </div>
      </div>

      <!-- Formulario completar / Ver resultado -->
      <div v-if="inspeccion.estado === 'ASIGNADA' || inspeccion.estado === 'REALIZADA'" class="bg-white rounded-xl shadow-sm p-5">
        <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Completar Inspección</h2>

        <form @submit.prevent="completar" class="space-y-4">
          <!-- Resultado -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-2">Resultado <span class="text-red-500">*</span></label>
            <div class="flex flex-wrap gap-3">
              <label
                v-for="op in ['APROBADO', 'OBSERVADO', 'RECHAZADO']"
                :key="op"
                class="flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all"
                :class="form.resultado === op ? 'border-dnb-primary bg-red-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <input
                  v-model="form.resultado"
                  type="radio"
                  :value="op"
                  class="w-4 h-4 text-dnb-primary"
                />
                <span class="text-sm font-semibold">{{ op }}</span>
              </label>
            </div>
          </div>

          <!-- Observaciones -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              v-model="form.observaciones"
              rows="4"
              maxlength="2000"
              class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-dnb-primary/30 resize-none"
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <RouterLink
              to="/admin/inspecciones"
              class="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </RouterLink>
            <button
              type="submit"
              :disabled="!form.resultado || guardando"
              class="px-6 py-2.5 rounded-lg bg-dnb-primary text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="guardando" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              <span v-else class="material-symbols-outlined text-[18px]">check</span>
              {{ guardando ? 'Guardando...' : 'Completar Inspección' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Ver resultado si ya completada -->
      <div v-else class="bg-white rounded-xl shadow-sm p-5">
        <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Resultado</h2>
        <div class="space-y-3">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Resultado</p>
            <p class="text-sm font-semibold text-gray-800">{{ inspeccion.resultado }}</p>
          </div>
          <div v-if="inspeccion.observaciones">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Observaciones</p>
            <p class="text-sm text-gray-700">{{ inspeccion.observaciones }}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Fecha de realización</p>
            <p class="text-sm text-gray-700">{{ formatearFechaHora(inspeccion.fecha_realizada) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import adminService from '../../services/admin.service'
import { useToast } from '../../composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const inspeccion = ref(null)
const cargando = ref(true)
const guardando = ref(false)
const form = ref({
  resultado: '',
  observaciones: '',
})

const id = computed(() => parseInt(route.params.id, 10))

async function cargar() {
  cargando.value = true
  try {
    inspeccion.value = await adminService.detalleInspeccion(id.value)
  } catch (e) {
    console.error(e)
    toast.error('No se pudo cargar la inspección')
  } finally {
    cargando.value = false
  }
}

async function completar() {
  if (!form.value.resultado) return
  guardando.value = true
  try {
    const resp = await adminService.completarInspeccion(id.value, {
      resultado: form.value.resultado,
      observaciones: form.value.observaciones,
    })
    toast.success(`Inspección completada: ${resp.solicitud.estado_nuevo}`)
    router.push('/admin/inspecciones')
  } catch (e) {
    console.error(e)
    toast.error(e.response?.data?.message || 'No se pudo completar')
  } finally {
    guardando.value = false
  }
}

function formatearFechaHora(f) {
  if (!f) return '—'
  return new Date(f).toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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