<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-white/5 backdrop-blur-sm border-b border-white/10">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
            <span class="text-white text-xl">🚒</span>
          </div>
          <div>
            <h1 class="text-white font-bold">SIPPCI DNB</h1>
            <p class="text-white/60 text-xs">Consulta Pública</p>
          </div>
        </RouterLink>
        <RouterLink
          to="/login"
          class="text-white/80 hover:text-white text-sm font-semibold transition-colors"
        >
          Iniciar sesión →
        </RouterLink>
      </div>
    </header>

    <!-- Contenido -->
    <main class="max-w-4xl mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-2">Consulta Pública de Trámites</h2>
        <p class="text-white/70 text-sm">
          Ingrese el código de su solicitud o escanee el QR de su certificado
        </p>
      </div>

      <!-- Buscador -->
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Código de solicitud
        </label>
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            v-model="codigo"
            @keyup.enter="consultar"
            type="text"
            placeholder="Ej: SIPPCI-PN-2026-00001"
            class="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/30 transition-all font-mono"
          />
          <button
            @click="consultar"
            :disabled="cargando || !codigo"
            class="px-6 py-3 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="cargando" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            <span v-else class="material-symbols-outlined text-[18px]">search</span>
            {{ cargando ? 'Buscando...' : 'Consultar' }}
          </button>
        </div>

        <!-- Ejemplos -->
        <div v-if="!resultado && !error" class="mt-4 flex flex-wrap gap-2 items-center">
          <span class="text-xs text-gray-500">Ejemplos:</span>
          <button
            v-for="ej in ejemplos"
            :key="ej"
            @click="codigo = ej; consultar()"
            class="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono transition-colors"
          >
            {{ ej }}
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-red-600 text-[24px]">error</span>
          <div>
            <h3 class="font-bold text-red-800">Error</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Resultado -->
      <div v-if="resultado" class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Header del resultado -->
        <div class="bg-gradient-to-r from-red-600 to-red-700 p-6">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p class="text-white/80 text-xs uppercase tracking-wider font-bold">Código</p>
              <h3 class="text-white text-2xl font-bold font-mono">{{ resultado.codigo }}</h3>
            </div>
            <span
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-sm"
            >
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {{ formatearEstado(resultado.estado) }}
            </span>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 space-y-6">
          <!-- Datos -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Módulo</p>
              <p class="text-sm font-semibold text-gray-900">{{ resultado.modulo }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Trámite</p>
              <p class="text-sm font-semibold text-gray-900">{{ resultado.submodulo }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Titular</p>
              <p class="text-sm font-semibold text-gray-900">{{ resultado.titular }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tipo</p>
              <p class="text-sm font-semibold text-gray-900">{{ resultado.tipo_persona }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha de solicitud</p>
              <p class="text-sm font-semibold text-gray-900">{{ formatearFecha(resultado.fecha_solicitud) }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Última actualización</p>
              <p class="text-sm font-semibold text-gray-900">{{ formatearFecha(resultado.fecha_ultima_actualizacion) }}</p>
            </div>
          </div>

          <!-- Certificado -->
          <div v-if="resultado.certificado" class="bg-green-50 border border-green-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-green-600 text-[24px]">verified</span>
              <div class="flex-1">
                <h4 class="font-bold text-green-900">Certificado Emitido</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                  <p><span class="text-green-700 font-semibold">N°:</span> {{ resultado.certificado.numero_registro }}</p>
                  <p><span class="text-green-700 font-semibold">Estado:</span> {{ resultado.certificado.estado }}</p>
                  <p><span class="text-green-700 font-semibold">Emisión:</span> {{ formatearFecha(resultado.certificado.fecha_emision) }}</p>
                  <p><span class="text-green-700 font-semibold">Vence:</span> {{ formatearFecha(resultado.certificado.fecha_vencimiento) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
            <a
              v-if="resultado.tiene_comprobante"
              :href="`${apiUrl}/solicitudes/${resultado.codigo}/comprobante`"
              target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold transition-colors"
            >
              <span class="material-symbols-outlined text-[18px]">receipt_long</span>
              Comprobante
            </a>
            <RouterLink
              to="/login"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
            >
              <span class="material-symbols-outlined text-[18px]">login</span>
              Iniciar sesión
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Info adicional -->
      <div class="mt-8 text-center text-xs text-white/40">
        <p>¿Necesitas más información? Contacta con la Dirección Nacional de Bomberos</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import publicService from '../services/public.service'

const codigo = ref('')
const cargando = ref(false)
const resultado = ref(null)
const error = ref('')

const ejemplos = [
  'SIPPCI-PN-2026-00001',
  'SIPPCI-PJ-2026-00001',
]

const apiUrl = computed(() => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

async function consultar() {
  if (!codigo.value.trim()) return

  cargando.value = true
  error.value = ''
  resultado.value = null

  try {
    resultado.value = await publicService.consultarSolicitud(codigo.value.trim())
  } catch (e) {
    console.error('Error:', e)
    error.value =
      e.response?.data?.message ||
      'No se encontró una solicitud con ese código'
  } finally {
    cargando.value = false
  }
}

function formatearEstado(estado) {
  const map = {
    BORRADOR: 'Borrador',
    PENDIENTE_PAGO: 'Pendiente de Pago',
    PAGO_CONFIRMADO: 'Pago Confirmado',
    COMPROBANTE_SUBIDO: 'Comprobante Subido',
    EN_VERIFICACION: 'En Verificación',
    OBSERVADO: 'Observado',
    APROBADO: 'Aprobado',
    INSPECCION: 'En Inspección',
    CERTIFICADO_EMITIDO: 'Certificado Emitido',
    ANULADO: 'Anulado',
  }
  return map[estado] || estado
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>