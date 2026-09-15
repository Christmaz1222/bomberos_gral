<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">{{ titulo }}</h1>
      <span class="text-xs text-gray-500 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
        🚧 En desarrollo
      </span>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-8 text-center">
      <span class="material-symbols-outlined text-6xl text-gray-300">construction</span>
      <p class="mt-3 text-gray-500">{{ descripcion }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: 'Vista en construcción. Se conectará en la siguiente sesión.' },
})
</script>