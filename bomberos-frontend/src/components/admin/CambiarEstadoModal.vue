<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-start justify-between p-5 border-b border-gray-100">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Cambiar Estado</h2>
              <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ codigo }}</p>
            </div>
            <button
              @click="$emit('close')"
              class="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4">
            <!-- Estado actual -->
            <div>
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Estado actual</p>
              <EstadoBadge :estado="estadoActual" />
            </div>

            <!-- Estados permitidos -->
            <div>
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                Nuevo estado ({{ estadosPermitidos.length }} disponibles)
              </p>

              <div v-if="cargandoEstados" class="space-y-2 animate-pulse">
                <div class="h-10 bg-gray-100 rounded-lg"></div>
                <div class="h-10 bg-gray-100 rounded-lg"></div>
              </div>

              <div v-else-if="estadosPermitidos.length === 0" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-xs text-yellow-800">
                  No hay transiciones disponibles para tu rol desde el estado actual.
                </p>
              </div>

              <div v-else class="space-y-2">
                <label
                  v-for="estado in estadosPermitidos"
                  :key="estado"
                  class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                  :class="estadoSeleccionado === estado ? 'border-dnb-primary bg-red-50' : 'border-gray-200 hover:border-gray-300'"
                >
                  <input
                    v-model="estadoSeleccionado"
                    type="radio"
                    :value="estado"
                    class="w-4 h-4 text-dnb-primary focus:ring-dnb-primary"
                  />
                  <EstadoBadge :estado="estado" />
                  <span v-if="estado === 'ANULADO'" class="ml-auto text-[10px] text-red-600 font-bold uppercase">
                    Irreversible
                  </span>
                </label>
              </div>
            </div>

            <!-- Observación -->
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                Observación {{ estadoSeleccionado === 'ANULADO' ? '(obligatoria)' : '(opcional)' }}
              </label>
              <textarea
                v-model="observacion"
                rows="3"
                maxlength="500"
                :placeholder="estadoSeleccionado === 'ANULADO' ? 'Motivo de la anulación...' : 'Detalles de la transición...'"
                class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all resize-none"
              ></textarea>
              <p class="text-[10px] text-gray-400 mt-1 text-right">{{ observacion.length }}/500</p>
            </div>

            <!-- Advertencia anulación -->
            <div v-if="estadoSeleccionado === 'ANULADO'" class="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <span class="material-symbols-outlined text-red-600 text-[18px]">warning</span>
              <div>
                <p class="text-xs font-bold text-red-800">Atención</p>
                <p class="text-[11px] text-red-700 mt-0.5">
                  Esta acción es irreversible. La solicitud quedará anulada permanentemente.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 p-5 border-t border-gray-100 bg-gray-50">
            <button
              @click="$emit('close')"
              :disabled="guardando"
              class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              @click="confirmar"
              :disabled="!puedeConfirmar || guardando"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="estadoSeleccionado === 'ANULADO' ? 'bg-red-600 hover:bg-red-700' : 'bg-dnb-primary hover:bg-red-700'"
            >
              <span v-if="guardando" class="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
              <span v-else class="material-symbols-outlined text-[16px]">check</span>
              {{ guardando ? 'Procesando...' : 'Confirmar cambio' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import EstadoBadge from './EstadoBadge.vue'
import adminService from '../../services/admin.service'
import { useToast } from '../../composables/useToast'

const props = defineProps({
  visible: { type: Boolean, default: false },
  codigo: { type: String, required: true },
  estadoActual: { type: String, required: true },
})

const emit = defineEmits(['close', 'cambio'])

const toast = useToast()

const cargandoEstados = ref(false)
const guardando = ref(false)
const estadosPermitidos = ref([])
const estadoSeleccionado = ref('')
const observacion = ref('')

const puedeConfirmar = computed(() => {
  if (!estadoSeleccionado.value) return false
  if (estadoSeleccionado.value === 'ANULADO' && observacion.value.trim().length < 5) return false
  return true
})

async function cargarEstados() {
  cargandoEstados.value = true
  try {
    const data = await adminService.obtenerEstadosPermitidos(props.codigo)
    estadosPermitidos.value = data.estadosPermitidos || []
  } catch (e) {
    console.error('Error cargando estados:', e)
    toast.error('No se pudieron cargar los estados permitidos')
    estadosPermitidos.value = []
  } finally {
    cargandoEstados.value = false
  }
}

async function confirmar() {
  if (!puedeConfirmar.value) return

  guardando.value = true
  try {
    const resultado = await adminService.cambiarEstado(props.codigo, {
      estado: estadoSeleccionado.value,
      observacion: observacion.value.trim() || undefined,
    })

    toast.success(`Estado cambiado a ${resultado.solicitud.estado_nuevo}`)
    emit('cambio', resultado)
    emit('close')
  } catch (e) {
    console.error('Error cambiando estado:', e)
    const mensaje = e.response?.data?.message || 'No se pudo cambiar el estado'
    toast.error(mensaje)
  } finally {
    guardando.value = false
  }
}

watch(() => props.visible, (nuevo) => {
  if (nuevo) {
    estadoSeleccionado.value = ''
    observacion.value = ''
    cargarEstados()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>