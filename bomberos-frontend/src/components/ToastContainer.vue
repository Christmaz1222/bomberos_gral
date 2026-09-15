<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm"
        :class="estiloToast(toast.tipo)"
      >
        <span class="material-symbols-outlined text-[22px] flex-shrink-0">
          {{ iconoToast(toast.tipo) }}
        </span>
        <p class="flex-1 text-sm font-medium">{{ toast.mensaje }}</p>
        <button
          @click="cerrar(toast.id)"
          class="p-1 rounded hover:bg-black/10 transition-colors flex-shrink-0"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, cerrar } = useToast()

function estiloToast(tipo) {
  const map = {
    success: 'bg-green-50 text-green-800 border-green-500',
    error: 'bg-red-50 text-red-800 border-red-500',
    warning: 'bg-orange-50 text-orange-800 border-orange-500',
    info: 'bg-blue-50 text-blue-800 border-blue-500',
  }
  return map[tipo] || map.info
}

function iconoToast(tipo) {
  const map = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  }
  return map[tipo] || 'info'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>