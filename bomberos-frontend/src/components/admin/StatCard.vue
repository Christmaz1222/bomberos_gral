<script setup>
defineProps({
  titulo: {
    type: String,
    required: true,
  },
  valor: {
    type: [String, Number],
    required: true,
  },
  subtitulo: {
    type: String,
    default: '',
  },
  icono: {
    type: String,
    required: true,
  },
  colorIcono: {
    type: String,
    default: 'text-blue-600',
  },
  colorFondoIcono: {
    type: String,
    default: 'bg-blue-50',
  },
  colorValor: {
    type: String,
    default: 'text-on-surface',
  },
  colorSubtitulo: {
    type: String,
    default: 'text-emerald-600',
  },
})
</script>

<template>
  <div class="p-space-lg rounded-xl bg-white shadow-sm">
    <div class="flex items-start justify-between">
      <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
        {{ titulo }}
      </span>
      <div
        :class="[
          'w-10 h-10 rounded-lg flex items-center justify-center',
          colorFondoIcono,
          colorIcono,
        ]"
      >
        <span class="material-symbols-outlined text-[22px]">{{ icono }}</span>
      </div>
    </div>
    <div :class="['font-display-lg text-display-lg mt-space-xs', colorValor]">
      {{ valor }}
    </div>
    <!-- TODO: Conectar subtitulo con datos reales del backend -->
    <span
      v-if="subtitulo"
      :class="[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-space-md text-label-sm font-medium',
        colorSubtitulo,
        colorSubtitulo.includes('emerald') ? 'bg-emerald-50' : '',
        colorSubtitulo.includes('amber') ? 'bg-amber-50' : '',
        colorSubtitulo.includes('red') || colorSubtitulo.includes('bomberos-red') ? 'bg-red-50' : '',
        colorSubtitulo.includes('blue') ? 'bg-blue-50' : '',
      ]"
    >
      {{ subtitulo }}
    </span>
  </div>
</template>
