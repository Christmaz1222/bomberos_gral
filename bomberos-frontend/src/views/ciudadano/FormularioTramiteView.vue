<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
        <RouterLink
          to="/mis-solicitudes/nueva"
          class="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </RouterLink>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
              {{ moduloNombre }}
            </span>
          </div>
          <h1 class="text-lg font-bold text-gray-900 mt-1 truncate">{{ submoduloNombre }}</h1>
          <p class="text-xs text-gray-500">Complete el formulario para iniciar su solicitud</p>
        </div>
      </div>
    </header>

    <!-- Contenido -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      <!-- Loading -->
      <div v-if="cargando" class="space-y-4 animate-pulse">
        <div class="h-32 bg-gray-100 rounded-xl"></div>
        <div class="h-48 bg-gray-100 rounded-xl"></div>
      </div>

      <!-- Error de submódulo -->
      <div v-else-if="!submodulo" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <span class="material-symbols-outlined text-6xl text-gray-300">error</span>
        <h2 class="mt-3 text-lg font-bold text-gray-700">Trámite no encontrado</h2>
        <p class="mt-1 text-sm text-gray-500">
          El trámite solicitado no existe o no está habilitado.
        </p>
        <RouterLink
          to="/mis-solicitudes/nueva"
          class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver a Trámites
        </RouterLink>
      </div>

      <!-- Formulario dinámico -->
      <component
        v-else
        :is="formularioComponente"
        :submodulo-id="submodulo.id"
        :submodulo-nombre="submodulo.nombre"
        :modulo-nombre="submodulo.modulo"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../../config/api'
import { useToast } from '../../composables/useToast'
import { getFormulario } from './formularios'

const route = useRoute()
const toast = useToast()

const submodulo = ref(null)
const cargando = ref(true)

const submoduloId = computed(() => parseInt(route.params.submoduloId, 10))

const moduloNombre = computed(() => submodulo.value?.modulo || '')
const submoduloNombre = computed(() => submodulo.value?.nombre || '')

const formularioComponente = computed(() => {
  // FASE 3a: seleccionar formulario según tipo_persona del usuario autenticado
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const tipoPersona = user.tipo_persona || 'NATURAL'
  return getFormulario(submoduloId.value, tipoPersona)
})

/**
 * Catálogo de submódulos (fallback local)
 */
const CATALOGO = [
  { id: 1, nombre: 'Registro de Profesionales', modulo: 'SIPPCI' },
  { id: 2, nombre: 'Capacitación', modulo: 'SIPPCI' },
  { id: 3, nombre: 'Cumplimiento SIPPCI', modulo: 'SIPPCI' },
  { id: 4, nombre: 'Armería', modulo: 'REGLAMENTACION' },
  { id: 5, nombre: 'Campos de Tiro', modulo: 'REGLAMENTACION' },
  { id: 6, nombre: 'Polígono de Tiro', modulo: 'REGLAMENTACION' },
  { id: 7, nombre: 'Actividades Aéreas', modulo: 'TURISMO' },
  { id: 8, nombre: 'Actividades Acuáticas', modulo: 'TURISMO' },
  { id: 9, nombre: 'Actividades Terrestres', modulo: 'TURISMO' },
]

async function cargar() {
  cargando.value = true
  try {
    const sm = CATALOGO.find((c) => c.id === submoduloId.value)
    if (sm) {
      submodulo.value = sm
    } else {
      try {
        const { data } = await apiClient.get(`/submodulos/${submoduloId.value}`)
        submodulo.value = {
          id: data.id,
          nombre: data.nombre,
          modulo: data.modulo?.nombre || '',
        }
      } catch {
        submodulo.value = null
      }
    }
  } catch (e) {
    console.error('Error cargando submódulo:', e)
    toast.error('No se pudo cargar el trámite')
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargar()
})
</script>
