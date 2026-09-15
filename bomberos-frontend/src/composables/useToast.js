import { ref } from 'vue'

const toasts = ref([])
let nextId = 1

export function useToast() {
  /**
   * Muestra un toast
   * @param {string} mensaje
   * @param {string} tipo - 'success' | 'error' | 'info' | 'warning'
   * @param {number} duracion - ms
   */
  function mostrar(mensaje, tipo = 'info', duracion = 4000) {
    const id = nextId++
    toasts.value.push({ id, mensaje, tipo })

    setTimeout(() => {
      cerrar(id)
    }, duracion)
  }

  function cerrar(id) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) {
      toasts.value.splice(idx, 1)
    }
  }

  return {
    toasts,
    mostrar,
    cerrar,
    success: (msg) => mostrar(msg, 'success'),
    error: (msg) => mostrar(msg, 'error', 5000),
    info: (msg) => mostrar(msg, 'info'),
    warning: (msg) => mostrar(msg, 'warning'),
  }
}