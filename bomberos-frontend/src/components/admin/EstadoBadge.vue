<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
    :class="estilos"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
    {{ texto }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  estado: {
    type: String,
    required: true,
  },
  compacto: {
    type: Boolean,
    default: false,
  },
})

const ESTADOS_MAP = {
  BORRADOR: {
    texto: 'Borrador',
    clases: 'bg-gray-100 text-gray-700',
  },
  PENDIENTE_PAGO: {
    texto: 'Pendiente Pago',
    clases: 'bg-orange-100 text-orange-700',
  },
  PAGO_CONFIRMADO: {
    texto: 'Pago OK',
    clases: 'bg-blue-100 text-blue-700',
  },
  EN_VERIFICACION: {
    texto: 'En Revisión',
    clases: 'bg-blue-100 text-blue-700',
  },
  OBSERVADO: {
    texto: 'Observado',
    clases: 'bg-red-100 text-red-700',
  },
  APROBADO: {
    texto: 'Aprobado',
    clases: 'bg-green-100 text-green-700',
  },
  INSPECCION: {
    texto: 'Inspección',
    clases: 'bg-purple-100 text-purple-700',
  },
  CERTIFICADO_EMITIDO: {
    texto: 'Certificado',
    clases: 'bg-emerald-100 text-emerald-700',
  },
  ANULADO: {
    texto: 'Anulado',
    clases: 'bg-gray-200 text-gray-600',
  },
}

const info = computed(() => {
  return ESTADOS_MAP[props.estado] || { texto: props.estado, clases: 'bg-gray-100 text-gray-700' }
})

const estilos = computed(() => info.value.clases)
const texto = computed(() => info.value.texto)
</script>