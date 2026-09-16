<script setup>
defineProps({
  breadcrumb: {
    type: Array,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  subtitulo: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="flex flex-col gap-space-sm">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
      <template v-for="(item, index) in breadcrumb" :key="index">
        <span :class="index === breadcrumb.length - 1 ? 'text-bomberos-red font-semibold' : ''">
          {{ item }}
        </span>
        <span
          v-if="index < breadcrumb.length - 1"
          class="material-symbols-outlined text-[14px]"
        >
          chevron_right
        </span>
      </template>
    </div>

    <!-- Título -->
    <h1 class="font-headline-lg text-headline-lg text-bomberos-navy">
      {{ titulo }}
    </h1>

    <!-- Subtítulo -->
    <p v-if="subtitulo" class="font-body-md text-body-md text-on-surface-variant">
      {{ subtitulo }}
    </p>
  </div>
</template>
