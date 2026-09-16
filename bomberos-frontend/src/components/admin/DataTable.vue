<script setup>
defineProps({
  columnas: {
    type: Array,
    required: true,
    validator: (value) => value.every((col) => col.key && col.label),
  },
  filas: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
    type: String,
    default: 'No hay datos disponibles',
  },
})

// TODO: Conectar filas con datos reales del backend via service
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <!-- Estado: Loading -->
      <div v-if="loading" class="p-space-lg text-center">
        <span class="text-on-surface-variant font-body-md">Cargando...</span>
      </div>

      <!-- Estado: Sin datos -->
      <div
        v-else-if="!filas || filas.length === 0"
        class="p-space-lg text-center"
      >
        <span class="text-on-surface-variant font-body-md">{{ emptyMessage }}</span>
      </div>

      <!-- Tabla -->
      <table v-else class="w-full text-left">
        <thead>
          <tr class="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
            <th
              v-for="col in columnas"
              :key="col.key"
              :class="[
                'py-space-sm px-space-md font-semibold',
                col.align === 'center' ? 'text-center' : '',
                col.align === 'right' ? 'text-right' : '',
              ]"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="font-body-sm text-body-sm">
          <tr
            v-for="(fila, index) in filas"
            :key="index"
            class="hover:bg-surface-container-low transition-colors"
          >
            <td
              v-for="col in columnas"
              :key="col.key"
              :class="[
                'py-space-sm px-space-md',
                col.align === 'center' ? 'text-center' : '',
                col.align === 'right' ? 'text-right' : '',
              ]"
            >
              <!-- Slot dinámico por columna para personalizar celdas -->
              <slot :name="'cell-' + col.key" :fila="fila" :value="fila[col.key]">
                {{ fila[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
