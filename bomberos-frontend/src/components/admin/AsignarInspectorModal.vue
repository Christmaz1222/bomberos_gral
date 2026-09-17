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
              <h2 class="text-lg font-bold text-gray-900">Asignar Inspector</h2>
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
            <!-- Inspector -->
            <div>
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                Inspector <span class="text-red-500">*</span>
              </p>

              <div v-if="cargandoInspectores" class="space-y-2 animate-pulse">
                <div class="h-10 bg-gray-100 rounded-lg"></div>
              </div>

              <div v-else-if="inspectores.length === 0" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-xs text-yellow-800">
                  No hay inspectores activos registrados.
                </p>
              </div>

              <div v-else class="space-y-2">
                <label
                  v-for="insp in inspectores"
                  :key="insp.id"
                  class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                  :class="inspectorSeleccionado === insp.id ? 'border-dnb-primary bg-red-50' : 'border-gray-200 hover:border-gray-300'"
                >
                  <input
                    v-model="inspectorSeleccionado"
                    type="radio"
                    :value="insp.id"
                    class="w-4 h-4 text-dnb-primary focus:ring-dnb-primary"
                  />
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-gray-800">{{ insp.nombre }}</span>
                    <span class="text-xs text-gray-500">{{ insp.email }}</span>
                  </div>
                  <span class="ml-auto px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                    {{ insp.rol }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Fecha programada -->
            <div>
              <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                Fecha programada (opcional)
              </label>
              <input
                v-model="fechaProgramada"
                type="datetime-local"
                class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
              />
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
              :disabled="!inspectorSeleccionado || guardando"
              class="px-4 py-2 rounded-lg bg-dnb-primary text-sm font-semibold text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="guardando" class="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
              <span v-else class="material-symbols-outlined text-[16px]">person_add</span>
              {{ guardando ? 'Asignando...' : 'Asignar Inspector' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import adminService from '../../services/admin.service'
import { useToast } from '../../composables/useToast'

const props = defineProps({
  visible: { type: Boolean, default: false },
  codigo: { type: String, required: true },
})

const emit = defineEmits(['close', 'asignado'])

const toast = useToast()

const cargandoInspectores = ref(false)
const guardando = ref(false)
const inspectores = ref([])
const inspectorSeleccionado = ref(null)
const fechaProgramada = ref('')

async function cargarInspectores() {
  cargandoInspectores.value = true
  try {
    inspectores.value = await adminService.listarUsuariosInternos('INSPECTOR')
  } catch (e) {
    console.error('Error cargando inspectores:', e)
    toast.error('No se pudieron cargar los inspectores')
    inspectores.value = []
  } finally {
    cargandoInspectores.value = false
  }
}

async function confirmar() {
  if (!inspectorSeleccionado.value) return

  guardando.value = true
  try {
    const resultado = await adminService.asignarInspector(props.codigo, {
      inspector_id: inspectorSeleccionado.value,
      fecha_programada: fechaProgramada.value ? new Date(fechaProgramada.value).toISOString() : undefined,
    })

    toast.success(`Inspector asignado a ${props.codigo}`)
    emit('asignado', resultado)
    emit('close')
  } catch (e) {
    console.error('Error asignando inspector:', e)
    const mensaje = e.response?.data?.message || 'No se pudo asignar el inspector'
    toast.error(mensaje)
  } finally {
    guardando.value = false
  }
}

watch(() => props.visible, (nuevo) => {
  if (nuevo) {
    inspectorSeleccionado.value = null
    fechaProgramada.value = ''
    cargarInspectores()
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