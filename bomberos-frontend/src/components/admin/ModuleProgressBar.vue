<script setup>
defineProps({
  nombre: {
    type: String,
    required: true,
  },
  tramites: {
    type: Number,
    required: true,
  },
  porcentaje: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: 'bg-bomberos-navy',
  },
})
</script>

<template>
  <div class="flex flex-col gap-space-xs">
    <div class="flex justify-between font-label-md">
      <span class="font-medium">{{ nombre }}</span>
      <span class="font-semibold">{{ tramites }} trámites ({{ porcentaje }}%)</span>
    </div>
    <div class="w-full h-2.5 rounded-full bg-surface-container-low overflow-hidden">
      <!-- TODO: Conectar porcentaje con datos reales del backend -->
      <div
        :class="['h-full rounded-full', color]"
        :style="{ width: porcentaje + '%' }"
      ></div>
    </div>
  </div>
</template>
