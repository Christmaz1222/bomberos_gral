<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
        <RouterLink
          to="/mis-solicitudes/nueva"
          class="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </RouterLink>
        <div>
          <h1 class="text-lg font-bold text-gray-900">Formulario de Trámite</h1>
          <p class="text-xs text-gray-500">Complete los datos requeridos</p>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6">
      <div class="bg-white rounded-xl shadow-sm p-8 text-center">
        <span class="material-symbols-outlined text-6xl text-gray-300">construction</span>
        <h2 class="mt-4 text-lg font-bold text-gray-700">Formulario en desarrollo</h2>
        <p class="mt-2 text-sm text-gray-500">
          El formulario para este trámite se implementará en la próxima sesión.
        </p>
        <p class="mt-1 text-xs text-gray-400">
          Submódulo ID: {{ id }}
        </p>
        <RouterLink
          to="/mis-solicitudes/nueva"
          class="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver a Trámites
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = computed(() => route.params.submoduloId)
</script>
