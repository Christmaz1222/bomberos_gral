<script setup>
import { ref, computed } from 'vue'
import { usePermisos } from '../../composables/usePermisos.js'

const { user } = usePermisos()

// TODO: conectar búsqueda global al backend
const busqueda = ref('')

const iniciales = computed(() => {
  const nombre = user.value?.nombre_completo || user.value?.nombre || user.value?.email || 'Usuario'
  // Primeras 2 letras de cada palabra, max 2 caracteres
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + (partes[1][0] || '')).toUpperCase()
})

const nombreDisplay = computed(() => user.value?.nombre_completo || user.value?.nombre || 'Usuario')
const cargoDisplay = computed(() => user.value?.grado || user.value?.unidad || user.value?.role || 'SC')
</script>

<template>
  <header
    class="fixed top-0 left-72 right-0 h-16 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg"
  >
    <!-- Izquierda: Búsqueda -->
    <div class="flex-1 max-w-xl">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">search</span>
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar expedientes, matrículas, razones sociales o actas..."
          class="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low border border-transparent focus:outline-none focus:border-bomberos-navy/20 focus:bg-white text-sm placeholder:text-on-surface-variant"
        />
      </div>
    </div>

    <!-- Derecha: Sistema + Notificaciones + Perfil -->
    <div class="flex items-center gap-4">
      <!-- Badge Sistema Operativo -->
      <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low">
        <span class="relative flex w-2 h-2">
          <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Sistema Operativo</span>
      </div>

      <!-- Notificaciones -->
      <button class="relative p-2 rounded-lg hover:bg-surface-container-low transition-colors">
        <span class="material-symbols-outlined text-[22px] text-on-surface-variant">notifications</span>
        <span class="absolute top-1 right-1 w-2 h-2 bg-bomberos-red rounded-full"></span>
      </button>

      <!-- Perfil -->
      <div class="flex items-center gap-3 pl-4 border-l border-surface-container-low">
        <div class="hidden sm:block text-right">
          <p class="font-title-sm text-title-sm text-on-surface">{{ nombreDisplay }}</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">{{ cargoDisplay }}</p>
        </div>
        <div class="w-9 h-9 rounded-full bg-bomberos-red flex items-center justify-center text-white font-semibold text-sm">
          {{ iniciales }}
        </div>
      </div>
    </div>
  </header>
</template>
