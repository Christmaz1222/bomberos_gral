<template>
  <div class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
    <div class="flex items-start justify-between">
      <span class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{{ label }}</span>
      <span
        class="w-8 h-8 rounded-lg flex items-center justify-center"
        :class="iconColorClass"
      >
        <span class="material-symbols-outlined text-[20px]" :class="{ 'animate-pulse': pulsing }">{{ icon }}</span>
      </span>
    </div>

    <div class="mt-3">
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-extrabold" :class="valueColorClass">{{ value }}</span>
        <span v-if="delta" class="text-[10px] font-bold" :class="deltaColorClass">{{ delta }}</span>
      </div>
      <div v-if="badge" class="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold" :class="badgeColorClass">
        {{ badge }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  icon: { type: String, default: 'analytics' },
  color: { type: String, default: 'primary' }, // primary, warning, error, success, info
  delta: { type: String, default: '' },
  badge: { type: String, default: '' },
  pulsing: { type: Boolean, default: false },
})

const colorMap = {
  primary: {
    iconBg: 'bg-red-100 text-dnb-primary',
    value: 'text-gray-900',
    delta: 'text-dnb-primary',
    badge: 'bg-red-100 text-red-700',
  },
  warning: {
    iconBg: 'bg-orange-100 text-orange-600',
    value: 'text-gray-900',
    delta: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
  },
  error: {
    iconBg: 'bg-red-100 text-red-600',
    value: 'text-red-600',
    delta: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
  },
  success: {
    iconBg: 'bg-green-100 text-green-600',
    value: 'text-gray-900',
    delta: 'text-green-600',
    badge: 'bg-green-100 text-green-700',
  },
  info: {
    iconBg: 'bg-blue-100 text-blue-600',
    value: 'text-blue-600',
    delta: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
}

const iconColorClass = computed(() => colorMap[props.color]?.iconBg || colorMap.primary.iconBg)
const valueColorClass = computed(() => colorMap[props.color]?.value || colorMap.primary.value)
const deltaColorClass = computed(() => colorMap[props.color]?.delta || colorMap.primary.delta)
const badgeColorClass = computed(() => colorMap[props.color]?.badge || colorMap.primary.badge)
</script>