<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
    <div class="text-xs text-gray-500">
      Mostrando
      <span class="font-semibold text-gray-700">
        {{ (page - 1) * limit + 1 }}–{{ Math.min(page * limit, total) }}
      </span>
      de <span class="font-semibold text-gray-700">{{ total }}</span> resultados
    </div>

    <div class="flex items-center gap-1">
      <button
        @click="$emit('change', 1)"
        :disabled="page === 1"
        class="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span class="material-symbols-outlined text-[18px]">first_page</span>
      </button>

      <button
        @click="$emit('change', page - 1)"
        :disabled="page === 1"
        class="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span class="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      <button
        v-for="p in paginasVisibles"
        :key="p"
        @click="typeof p === 'number' ? $emit('change', p) : null"
        :disabled="p === '...'"
        class="min-w-8 h-8 px-2 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors"
        :class="p === page ? 'bg-dnb-dark text-white' : p === '...' ? 'text-gray-400 cursor-default' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'"
      >
        {{ p }}
      </button>

      <button
        @click="$emit('change', page + 1)"
        :disabled="page === totalPages"
        class="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span class="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>

      <button
        @click="$emit('change', totalPages)"
        :disabled="page === totalPages"
        class="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span class="material-symbols-outlined text-[18px]">last_page</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  limit: { type: Number, required: true },
  total: { type: Number, required: true },
})

defineEmits(['change'])

const totalPages = computed(() => Math.ceil(props.total / props.limit))

const paginasVisibles = computed(() => {
  const total = totalPages.value
  const current = props.page
  const paginas = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) paginas.push(i)
    return paginas
  }

  paginas.push(1)
  if (current > 3) paginas.push('...')

  const inicio = Math.max(2, current - 1)
  const fin = Math.min(total - 1, current + 1)
  for (let i = inicio; i <= fin; i++) paginas.push(i)

  if (current < total - 2) paginas.push('...')
  paginas.push(total)

  return paginas
})
</script>