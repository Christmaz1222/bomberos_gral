<template>
  <div class="flex flex-col gap-5">
    <!-- Encabezado -->
    <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded bg-dnb-primary text-white text-[10px] font-bold uppercase tracking-wider">
            Sistema
          </span>
          <span class="text-gray-500 text-xs">• Alertas</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Alertas del Sistema</h1>
        <p class="text-sm text-gray-500 mt-1">
          Alertas generadas automáticamente + alertas administrativas
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center bg-white rounded-lg shadow-sm px-1 py-1">
          <button
            @click="filtro = 'todas'"
            class="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
            :class="filtro === 'todas' ? 'bg-dnb-dark text-white' : 'text-gray-600 hover:bg-gray-100'"
          >
            Todas ({{ alertas?.meta.total || 0 }})
          </button>
          <button
            @click="filtro = 'noLeidas'"
            class="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
            :class="filtro === 'noLeidas' ? 'bg-dnb-dark text-white' : 'text-gray-600 hover:bg-gray-100'"
          >
            No leídas ({{ alertas?.meta.noLeidas || 0 }})
          </button>
        </div>

        <button
          v-if="alertas && alertas.meta.noLeidas > 0"
          @click="marcarTodas"
          :disabled="marcandoTodas"
          class="flex items-center gap-2 px-3 py-2 bg-dnb-primary text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': marcandoTodas }">
            {{ marcandoTodas ? 'progress_activity' : 'done_all' }}
          </span>
          Marcar todas
        </button>

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

    <!-- Lista de alertas -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <!-- Skeleton -->
      <div v-if="cargando" class="space-y-3 animate-pulse">
        <div v-for="i in 4" :key="i" class="h-20 bg-gray-100 rounded-lg"></div>
      </div>

      <!-- Lista real -->
      <div v-else-if="alertasFiltradas.length" class="flex flex-col gap-3">
        <div
          v-for="alerta in alertasFiltradas"
          :key="alerta.id"
          class="p-4 rounded-lg border-l-4 transition-colors"
          :class="[
            alerta.prioridad === 'CRITICA' ? 'bg-red-50 border-red-500' : '',
            alerta.prioridad === 'ALTA' ? 'bg-orange-50 border-orange-500' : '',
            alerta.prioridad === 'NORMAL' ? 'bg-blue-50 border-blue-500' : '',
            alerta.prioridad === 'BAJA' ? 'bg-gray-50 border-gray-400' : '',
            !alerta.prioridad ? 'bg-gray-50 border-gray-400' : '',
          ]"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap mb-2">
                <span
                  class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  :class="[
                    alerta.prioridad === 'CRITICA' ? 'bg-red-200 text-red-800' : '',
                    alerta.prioridad === 'ALTA' ? 'bg-orange-200 text-orange-800' : '',
                    alerta.prioridad === 'NORMAL' ? 'bg-blue-200 text-blue-800' : '',
                    alerta.prioridad === 'BAJA' ? 'bg-gray-200 text-gray-700' : '',
                    !alerta.prioridad ? 'bg-gray-200 text-gray-700' : '',
                  ]"
                >
                  {{ alerta.tipo }}
                </span>
                <span
                  v-if="alerta.prioridad"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="{
                    'bg-red-500 text-white': alerta.prioridad === 'CRITICA',
                    'bg-orange-500 text-white': alerta.prioridad === 'ALTA',
                    'bg-blue-500 text-white': alerta.prioridad === 'NORMAL',
                    'bg-gray-500 text-white': alerta.prioridad === 'BAJA',
                  }"
                >
                  {{ alerta.prioridad }}
                </span>
                <span
                  v-if="!alerta.leida"
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-dnb-primary"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-dnb-primary animate-pulse"></span>
                  NUEVA
                </span>
                <span v-if="alerta.origen" class="text-[10px] text-gray-400 font-mono">
                  ({{ alerta.origen }})
                </span>
              </div>

              <h3 class="text-sm font-bold text-gray-900">{{ alerta.titulo }}</h3>
              <p class="text-xs text-gray-600 mt-1">{{ alerta.mensaje }}</p>
              <p class="text-[10px] text-gray-400 mt-2">
                {{ tiempoRelativo(alerta.created_at) }}
              </p>
            </div>

            <div v-if="alerta.url_accion || (!alerta.leida && !String(alerta.id).startsWith('gen-'))" class="flex flex-col gap-2 flex-shrink-0">
              <RouterLink
                v-if="alerta.url_accion"
                :to="alerta.url_accion"
                @click="irAAccion(alerta)"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dnb-dark text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
              >
                Ver
                <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
              </RouterLink>

              <button
                v-if="!alerta.leida && !String(alerta.id).startsWith('gen-')"
                @click="marcarComoLeida(alerta)"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                <span class="material-symbols-outlined text-[14px]">check</span>
                Marcar leída
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="py-16 text-center">
        <span class="material-symbols-outlined text-6xl text-gray-300">check_circle</span>
        <h3 class="mt-3 text-lg font-semibold text-gray-700">
          {{ filtro === 'noLeidas' ? 'Sin alertas no leídas' : 'Sin alertas' }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          Todo está bajo control
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import adminService from '../../services/admin.service'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const alertas = ref(null)
const cargando = ref(true)
const filtro = ref('todas')
const marcandoTodas = ref(false)

const alertasFiltradas = computed(() => {
  if (!alertas.value) return []
  if (filtro.value === 'noLeidas') {
    return alertas.value.data.filter((a) => !a.leida)
  }
  return alertas.value.data
})

async function cargar() {
  cargando.value = true
  try {
    alertas.value = await adminService.listarAlertas(false)
  } catch (e) {
    console.error('Error cargando alertas:', e)
    toast.error('No se pudieron cargar las alertas')
    alertas.value = null
  } finally {
    cargando.value = false
  }
}

function tiempoRelativo(fecha) {
  if (!fecha) return ''
  const segundos = Math.floor((Date.now() - new Date(fecha)) / 1000)
  if (segundos < 60) return `hace ${segundos}s`
  if (segundos < 3600) return `hace ${Math.floor(segundos / 60)}m`
  if (segundos < 86400) return `hace ${Math.floor(segundos / 3600)}h`
  return `hace ${Math.floor(segundos / 86400)}d`
}

async function marcarComoLeida(alerta) {
  if (String(alerta.id).startsWith('gen-')) {
    toast.info('Esta alerta es generada automáticamente')
    return
  }

  try {
    await adminService.marcarAlertaLeida(alerta.id)
    toast.success('Alerta marcada como leída')
    alerta.leida = true
    if (alertas.value?.meta) {
      alertas.value.meta.noLeidas = Math.max(0, alertas.value.meta.noLeidas - 1)
    }
  } catch (e) {
    console.error('Error marcando alerta:', e)
    toast.error('No se pudo marcar la alerta')
  }
}

async function marcarTodas() {
  if (!window.confirm('¿Marcar todas las alertas como leídas?')) return

  marcandoTodas.value = true
  try {
    const resultado = await adminService.marcarTodasAlertasLeidas()
    toast.success(resultado.message || 'Alertas marcadas como leídas')
    await cargar()
  } catch (e) {
    console.error('Error marcando todas:', e)
    toast.error('No se pudieron marcar las alertas')
  } finally {
    marcandoTodas.value = false
  }
}

function irAAccion(alerta) {
  if (!alerta.leida && !String(alerta.id).startsWith('gen-')) {
    adminService.marcarAlertaLeida(alerta.id).catch(() => {})
  }
}

onMounted(() => {
  cargar()
})
</script>