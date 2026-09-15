<template>
  <header class="fixed top-0 left-72 right-0 h-16 bg-white shadow-sm z-40 flex items-center justify-between px-6 border-b border-gray-100">
    <div class="flex items-center gap-4">
      <div class="hidden md:flex items-center gap-2 bg-blue-50 text-dnb-dark px-3 py-1 rounded-full">
        <span class="material-symbols-outlined text-[16px] text-dnb-primary">verified_user</span>
        <span class="text-xs font-bold">Gestión Activa: {{ new Date().getFullYear() }}</span>
      </div>
    </div>

    <div class="flex-1 max-w-md mx-4 hidden lg:block">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[20px]">search</span>
        <input
          v-model="busqueda"
          @keyup.enter="buscar"
          type="text"
          placeholder="Buscar trámites, expedientes o RUC... (Ctrl+K)"
          class="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-50 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
        />
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        @click="$emit('refrescar')"
        :disabled="refrescando"
        class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-50"
        title="Refrescar datos"
      >
        <span
          class="material-symbols-outlined text-[20px]"
          :class="{ 'animate-spin': refrescando }"
        >
          refresh
        </span>
      </button>

      <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50">
        <span class="material-symbols-outlined text-[16px] text-dnb-primary">lock</span>
        <span class="text-[10px] text-gray-500 font-semibold">SSL Seguro</span>
      </div>

      <button
        @click="$emit('notificaciones')"
        class="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        title="Notificaciones"
      >
        <span class="material-symbols-outlined text-[22px]">notifications</span>
        <span
          v-if="notificacionesCount > 0"
          class="absolute top-1 right-1 w-4 h-4 rounded-full bg-dnb-primary text-white text-[9px] flex items-center justify-center font-bold"
        >
          {{ notificacionesCount > 9 ? '9+' : notificacionesCount }}
        </span>
      </button>

      <div class="flex items-center gap-2 pl-3 border-l border-gray-200">
        <div class="w-8 h-8 rounded-full bg-dnb-primary flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-[18px]">person</span>
        </div>
        <div class="hidden md:flex flex-col text-left">
          <span class="text-xs font-semibold text-gray-800 leading-tight">{{ usuario.nombre }}</span>
          <span class="text-[10px] text-gray-500">{{ usuario.rol }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  notificacionesCount: { type: Number, default: 0 },
  refrescando: { type: Boolean, default: false },
})

defineEmits(['notificaciones', 'refrescar'])

const router = useRouter()
const busqueda = ref('')

const usuario = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return { nombre: 'Usuario', rol: 'ADMIN' }
  }
})

function buscar() {
  if (!busqueda.value.trim()) return
  router.push({ path: '/admin/solicitudes', query: { q: busqueda.value } })
}
</script>