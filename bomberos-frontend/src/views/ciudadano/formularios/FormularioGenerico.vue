<template>
  <form @submit.prevent="enviar" class="space-y-6">
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-red-600">description</span>
        Información del Trámite
      </h3>

      <p class="text-sm text-gray-500 mb-4">
        Este trámite se encuentra disponible. Puede completar los datos iniciales y observaciones para iniciar el proceso.
      </p>

      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">
          Observaciones / Descripción de la Solicitud
        </label>
        <textarea
          v-model="form.observaciones"
          rows="5"
          maxlength="500"
          placeholder="Describa el objetivo o detalles de su solicitud..."
          class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-600/30 transition-all resize-none"
        ></textarea>
        <p class="text-[10px] text-gray-400 mt-1 text-right">{{ form.observaciones.length }}/500</p>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:justify-end gap-3">
      <RouterLink
        to="/mis-solicitudes/nueva"
        class="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center"
      >
        Cancelar
      </RouterLink>
      <button
        type="submit"
        :disabled="enviando"
        class="px-6 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        <span v-if="enviando" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
        <span v-else class="material-symbols-outlined text-[18px]">send</span>
        {{ enviando ? 'Enviando...' : 'Crear Solicitud' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../../config/api'
import { useToast } from '../../../composables/useToast'

const props = defineProps({
  submoduloId: { type: Number, required: true },
  submoduloNombre: { type: String, required: true },
  moduloNombre: { type: String, required: true },
})

const router = useRouter()
const toast = useToast()
const enviando = ref(false)
const form = ref({ observaciones: '' })

async function enviar() {
  enviando.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const payload = {
      submodulo_id: props.submoduloId,
      tipo_persona: user.tipo_persona || 'NATURAL',
      datos_especificos: {
        observaciones: form.value.observaciones?.trim() || '',
        tipo_formulario: 'GENERICO',
        submodulo_nombre: props.submoduloNombre,
      },
      observacion: form.value.observaciones?.trim() || null,
    }

    const { data } = await apiClient.post('/solicitudes', payload)
    const codigo = data.solicitud?.codigo || data.codigo
    toast.success(`Solicitud creada: ${codigo}`)
    router.push(`/mis-solicitudes/${codigo}`)
  } catch (e) {
    console.error('Error:', e)
    toast.error(e.response?.data?.message || 'No se pudo crear la solicitud')
  } finally {
    enviando.value = false
  }
}
</script>
