<template>
  <div class="bg-white rounded-xl shadow-sm p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-red-600 text-[20px]">checklist</span>
        <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Requisitos del Trámite
        </h2>
      </div>
      <div v-if="progreso" class="flex items-center gap-2">
        <span
          class="text-xs font-bold px-2.5 py-0.5 rounded-full"
          :class="progreso.completo ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
        >
          {{ progreso.obligatoriosCumplidos }}/{{ progreso.obligatorios }} Cumplidos
        </span>
      </div>
    </div>

    <!-- Barra de progreso -->
    <div v-if="progreso && progreso.obligatorios > 0" class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-4">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="progreso.completo ? 'bg-green-500' : 'bg-red-600'"
        :style="{ width: `${Math.min(100, Math.round((progreso.obligatoriosCumplidos / progreso.obligatorios) * 100))}%` }"
      ></div>
    </div>

    <!-- Skeleton de carga -->
    <div v-if="cargando" class="space-y-2 animate-pulse">
      <div v-for="i in 6" :key="i" class="h-16 bg-gray-100 rounded-lg"></div>
    </div>

    <!-- Lista de requisitos -->
    <div v-else-if="requisitos.length" class="flex flex-col gap-2.5">
      <div
        v-for="req in requisitos"
        :key="req.id"
        class="flex items-start gap-3 p-3.5 rounded-lg border transition-all"
        :class="{
          'border-green-200 bg-green-50/50': req.estado === 'CUMPLIDO',
          'border-orange-200 bg-orange-50/50': req.estado === 'OBSERVADO',
          'border-gray-200 bg-white hover:border-gray-300': req.estado === 'PENDIENTE',
        }"
      >
        <!-- Icono de estado -->
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs"
          :class="{
            'bg-green-500 text-white': req.estado === 'CUMPLIDO',
            'bg-orange-500 text-white': req.estado === 'OBSERVADO',
            'bg-gray-200 text-gray-500': req.estado === 'PENDIENTE',
          }"
        >
          <span class="material-symbols-outlined text-[18px]">
            {{ req.estado === 'CUMPLIDO' ? 'check' : req.estado === 'OBSERVADO' ? 'warning' : 'hourglass_empty' }}
          </span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-bold text-gray-900">{{ req.nombre }}</span>
            <span v-if="req.obligatorio" class="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
              OBLIGATORIO
            </span>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full"
              :class="{
                'bg-green-100 text-green-700': req.estado === 'CUMPLIDO',
                'bg-orange-100 text-orange-700': req.estado === 'OBSERVADO',
                'bg-gray-100 text-gray-600': req.estado === 'PENDIENTE',
              }"
            >
              {{ req.estado }}
            </span>
          </div>
          <p v-if="req.descripcion" class="text-xs text-gray-500 mt-0.5">{{ req.descripcion }}</p>

          <!-- Documento asociado -->
          <div v-if="req.documento" class="mt-2 flex items-center gap-2 text-xs text-gray-600 bg-white px-2.5 py-1 rounded border border-gray-100 w-fit">
            <span class="material-symbols-outlined text-[16px] text-red-500">picture_as_pdf</span>
            <span class="truncate max-w-xs font-medium">{{ req.documento.nombre_original }}</span>
            <span class="text-gray-300">·</span>
            <span class="text-[10px] text-gray-400">{{ formatearFecha(req.documento.fecha_subida) }}</span>
          </div>

          <!-- Observación -->
          <div v-if="req.observacion" class="mt-2 p-2 bg-orange-50 border-l-2 border-orange-400 rounded text-xs text-orange-800">
            <span class="font-semibold">Observación:</span> {{ req.observacion }}
          </div>

          <!-- Verificador -->
          <p v-if="req.verificador" class="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">verified_user</span>
            Verificado por <strong class="text-gray-600">{{ req.verificador.nombre }}</strong> ({{ req.verificador.rol }}) el {{ formatearFechaHora(req.fecha_verificacion) }}
          </p>
        </div>

        <!-- Acciones -->
        <div class="flex items-center gap-1">
          <button
            v-if="req.estado !== 'CUMPLIDO'"
            @click="marcarCumplido(req)"
            :disabled="procesando[req.id]"
            class="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors disabled:opacity-50 cursor-pointer"
            title="Marcar como cumplido"
          >
            <span class="material-symbols-outlined text-[20px]">check_circle</span>
          </button>
          <button
            v-if="req.estado !== 'OBSERVADO'"
            @click="observar(req)"
            :disabled="procesando[req.id]"
            class="p-1.5 rounded-lg hover:bg-orange-100 text-orange-600 transition-colors disabled:opacity-50 cursor-pointer"
            title="Observar requisito"
          >
            <span class="material-symbols-outlined text-[20px]">warning</span>
          </button>
          <button
            v-if="req.estado !== 'PENDIENTE'"
            @click="marcarPendiente(req)"
            :disabled="procesando[req.id]"
            class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50 cursor-pointer"
            title="Revertir a pendiente"
          >
            <span class="material-symbols-outlined text-[20px]">undo</span>
          </button>
        </div>
      </div>
    </div>

    <p v-else class="text-sm text-gray-500 text-center py-6">
      No hay requisitos configurados para este trámite
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminService from '../../services/admin.service'
import { useToast } from '../../composables/useToast'

const props = defineProps({
  codigo: { type: String, required: true },
})

const emit = defineEmits(['updated'])

const toast = useToast()
const requisitos = ref([])
const progreso = ref(null)
const cargando = ref(true)
const procesando = ref({})

async function cargar() {
  cargando.value = true
  try {
    const data = await adminService.listarRequisitos(props.codigo)
    requisitos.value = data.requisitos || []
    progreso.value = data.progreso || null
  } catch (e) {
    console.error('Error cargando requisitos:', e)
    toast.error('No se pudieron cargar los requisitos del trámite')
  } finally {
    cargando.value = false
  }
}

async function actualizar(req, estado, observacion = null) {
  procesando.value[req.id] = true
  try {
    await adminService.actualizarRequisito(props.codigo, req.id, { estado, observacion })
    toast.success(`Requisito marcado como ${estado}`)
    await cargar()
    emit('updated')
  } catch (e) {
    console.error('Error actualizando requisito:', e)
    toast.error(e.response?.data?.message || 'No se pudo actualizar el requisito')
  } finally {
    procesando.value[req.id] = false
  }
}

async function marcarCumplido(req) {
  await actualizar(req, 'CUMPLIDO')
}

async function observar(req) {
  const obs = window.prompt('Motivo de la observación del requisito:')
  if (obs === null) return
  if (!obs.trim()) {
    toast.error('Debe ingresar un motivo para observar el requisito')
    return
  }
  await actualizar(req, 'OBSERVADO', obs.trim())
}

async function marcarPendiente(req) {
  await actualizar(req, 'PENDIENTE')
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
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
