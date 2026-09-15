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
        <div>
          <h1 class="text-lg font-bold text-gray-900">Nueva Solicitud</h1>
          <p class="text-xs text-gray-500">Selecciona el trámite que deseas iniciar</p>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6">
      <!-- Trámites habilitados -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Mis Trámites Habilitados
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">
              Estos son los trámites que seleccionaste al registrarte
            </p>
          </div>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
            {{ tramitesHabilitados.length }}
          </span>
        </div>

        <div v-if="cargando" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="i in 4" :key="i" class="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>

        <div v-else-if="tramitesHabilitados.length" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <RouterLink
            v-for="t in tramitesHabilitados"
            :key="t.id"
            :to="`/mis-solicitudes/nueva/${t.id}`"
            class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md border-2 border-transparent hover:border-red-600/30 transition-all group"
          >
            <div class="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-red-600 text-[24px]">{{ t.icono }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {{ t.modulo }}
              </span>
              <h3 class="font-bold text-gray-900 text-sm mt-0.5">{{ t.nombre }}</h3>
              <p class="text-xs text-gray-500 mt-1">Click para iniciar el trámite</p>
            </div>
            <span class="material-symbols-outlined text-gray-300 group-hover:text-red-600 transition-colors">
              arrow_forward
            </span>
          </RouterLink>
        </div>

        <div v-else class="bg-white rounded-xl shadow-sm p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-gray-300">info</span>
          <p class="mt-2 text-sm text-gray-600 font-semibold">
            No tienes trámites habilitados
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Contacta con la Dirección Nacional de Bomberos para más información
          </p>
        </div>
      </section>

      <!-- Todos los trámites disponibles (agregar más) -->
      <section v-if="tramitesNoHabilitados.length" class="border-t border-gray-200 pt-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Otros Trámites Disponibles
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">
              Puedes solicitar acceso a estos trámites adicionales
            </p>
          </div>
          <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {{ tramitesNoHabilitados.length }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="t in tramitesNoHabilitados"
            :key="t.id"
            class="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 opacity-70"
          >
            <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-gray-400 text-[24px]">{{ t.icono }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {{ t.modulo }}
              </span>
              <h3 class="font-bold text-gray-600 text-sm mt-0.5">{{ t.nombre }}</h3>
              <p class="text-xs text-gray-400 mt-1">No habilitado para tu cuenta</p>
            </div>
          </div>
        </div>

        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
          <span class="material-symbols-outlined text-blue-600 text-[18px]">info</span>
          <p class="text-xs text-blue-800">
            Para habilitar más trámites, contacta con la DNB o solicita una ampliación desde tu cuenta.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient from '../../config/api'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const cargando = ref(true)
const tramitesDelUsuario = ref([])
const submodulosCatalogo = ref([])

const tramitesHabilitados = computed(() =>
  submodulosCatalogo.value.filter((sm) =>
    tramitesDelUsuario.value.includes(sm.nombre),
  ),
)

const tramitesNoHabilitados = computed(() =>
  submodulosCatalogo.value.filter(
    (sm) => !tramitesDelUsuario.value.includes(sm.nombre),
  ),
)

async function cargar() {
  cargando.value = true
  try {
    const { data: perfil } = await apiClient.get('/auth/perfil')
    tramitesDelUsuario.value = perfil.tramites_solicitados || perfil.tramitesSolicitados || []
    submodulosCatalogo.value = getCatalogoSubmodulos()
  } catch (e) {
    console.error('Error cargando perfil:', e)
    toast.error('No se pudieron cargar tus trámites')
  } finally {
    cargando.value = false
  }
}

function getCatalogoSubmodulos() {
  return [
    { id: 1, nombre: 'Registro de Profesionales', modulo: 'SIPPCI', icono: 'badge' },
    { id: 2, nombre: 'Capacitación', modulo: 'SIPPCI', icono: 'school' },
    { id: 3, nombre: 'Cumplimiento SIPPCI', modulo: 'SIPPCI', icono: 'assignment' },
    { id: 4, nombre: 'Armería', modulo: 'REGLAMENTACION', icono: 'security' },
    { id: 5, nombre: 'Campos de Tiro', modulo: 'REGLAMENTACION', icono: 'target' },
    { id: 6, nombre: 'Polígono de Tiro', modulo: 'REGLAMENTACION', icono: 'gps_fixed' },
    { id: 7, nombre: 'Actividades Aéreas', modulo: 'TURISMO', icono: 'flight' },
    { id: 8, nombre: 'Actividades Acuáticas', modulo: 'TURISMO', icono: 'kayaking' },
    { id: 9, nombre: 'Actividades Terrestres', modulo: 'TURISMO', icono: 'hiking' },
  ]
}

onMounted(() => {
  cargar()
})
</script>
