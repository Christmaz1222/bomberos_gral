<script setup>
import { useRouter } from 'vue-router'

defineProps({
  titulo: {
    type: String,
    default: 'En desarrollo',
  },
  subtitulo: {
    type: String,
    default: 'Esta vista está siendo construida. Pronto estará disponible.',
  },
})

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div class="w-20 h-20 rounded-2xl bg-surface-container-low flex items-center justify-center mb-6">
      <span class="material-symbols-outlined text-[40px] text-on-surface-variant">construction</span>
    </div>
    <h1 class="font-headline-lg text-headline-lg text-bomberos-navy">{{ titulo }}</h1>
    <p class="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">{{ subtitulo }}</p>
    <button
      class="mt-8 px-6 py-2.5 rounded-lg bg-bomberos-navy text-white text-sm font-semibold hover:bg-bomberos-navy/90 transition-colors"
      @click="router.push('/admin/dashboard')"
    >
      Volver al Panel Principal
    </button>
  </div>
</template>
