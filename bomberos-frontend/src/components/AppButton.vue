<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  variant: { type: String, default: 'primary' },
  submit: { type: Boolean, default: false },
})
</script>

<template>
  <button
    :type="submit ? 'submit' : 'button'"
    :disabled="disabled || loading"
    :aria-busy="loading"
    class="inline-flex w-full items-center justify-center space-x-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2"
    :class="{
      'bg-slate-900 text-white shadow-md hover:bg-slate-800': variant === 'primary',
      'border border-slate-200 text-slate-700 hover:bg-slate-50': variant === 'secondary',
      'bg-red-600 text-white shadow-md hover:bg-red-700': variant === 'danger',
      'bg-red-700 border border-white text-white hover:bg-red-900': variant === 'danger-outline',
    }"
  >
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <slot />
  </button>
</template>