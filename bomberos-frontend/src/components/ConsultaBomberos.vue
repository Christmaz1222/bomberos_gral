<script setup>
import { ref } from 'vue'

const codigoConsulta = ref('')
const cargando = ref(false)
const infoEncontrada = ref(null)
const errorBusqueda = ref('')

const buscarTramite = async () => {
  if (!codigoConsulta.value.trim()) return
  cargando.value = true
  errorBusqueda.value = ''
  infoEncontrada.value = null

  try {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    infoEncontrada.value = {
      codigo: codigoConsulta.value.toUpperCase(),
      tipoTramite: 'Certificado de Inspección Técnica de Seguridad (SIPAB)',
      solicitante: 'Comercial e Industrias "El Progreso"',
      fechaSolicitud: '18 de Junio, 2026',
      estado: 'Aprobado',
      inspectorAsignado: 'Tte. Ramos J.',
      detalles: 'Inspección de sistemas de extinción y vías de evacuación completada con éxito. Certificado listo para firma digital.'
    }
  } catch (err) {
    errorBusqueda.value = 'No se encontró ningún trámite o certificado con el código introducido. Verifique el documento.'
  } finally {
    cargando.value = false
  }
}

const getEstadoEstilo = (estado) => {
  switch (estado) {
    case 'Aprobado': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'En Inspección': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Observado': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
    
    <!-- NAVBAR MINIMALISTA -->
    <header class="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3 font-bold text-base tracking-tight text-slate-900">
          <div class="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-red-600/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span>BOMBEROS <span class="text-red-600 font-medium">SISTEMAS</span></span>
        </div>
        
        <nav class="flex items-center space-x-4 text-xs font-semibold">
          <a href="#" class="text-slate-500 hover:text-slate-800 transition-colors">Guía de Trámites</a>
          <span class="h-4 w-px bg-slate-200"></span>
          <button class="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-all">
            Sistema Interno
          </button>
        </nav>
      </div>
    </header>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
      
      <div class="text-center max-w-2xl mb-10">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700 mb-4 border border-red-100">
          <span class="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
          Plataforma de Consulta Ciudadana
        </span>
        <h1 class="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-3">
          Verificación de Trámites y Certificados
        </h1>
        <p class="text-sm md:text-base text-slate-500 leading-relaxed">
          Consulte el estado de sus inspecciones técnicas, licencias de seguridad o valide la legalidad de un certificado emitido por la dirección de bomberos.
        </p>
      </div>

      <!-- Tarjeta de Búsqueda -->
      <div class="w-full max-w-xl bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 md:p-8">
        
        <form @submit.prevent="buscarTramite" class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-grow">
            <input 
              v-model="codigoConsulta"
              type="text" 
              placeholder="Ej: CERT-2026-X94" 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 focus:bg-white transition-all text-slate-800 text-sm font-medium placeholder:text-slate-400"
              :disabled="cargando"
            />
          </div>
          <button 
            type="submit"
            :disabled="cargando"
            class="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap disabled:opacity-75 shadow-red-600/10"
          >
            <span v-if="cargando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ cargando ? 'Buscando...' : 'Verificar Registro' }}</span>
          </button>
        </form>

        <div v-if="errorBusqueda" class="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium text-center">
          {{ errorBusqueda }}
        </div>

        <!-- RESULTADO -->
        <div v-if="infoEncontrada" class="mt-8 pt-6 border-t border-slate-100 space-y-4">
          
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nro. de Trámite</p>
              <h3 class="text-base font-bold text-slate-900 tracking-tight">{{ infoEncontrada.codigo }}</h3>
            </div>
            <span :class="['px-2.5 py-1 rounded-md text-xs font-semibold border', getEstadoEstilo(infoEncontrada.estado)]">
              {{ infoEncontrada.estado }}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tipo de Trámite / Certificación</span>
              <span class="font-semibold text-slate-700">{{ infoEncontrada.tipoTramite }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 border-t border-slate-200/50 pt-2 mt-1">
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Contribuyente / Empresa</span>
                <span class="font-medium text-slate-600">{{ infoEncontrada.solicitante }}</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Inspector Asignado</span>
                <span class="font-medium text-slate-600">{{ infoEncontrada.inspectorAsignado }}</span>
              </div>
            </div>
            <div class="border-t border-slate-200/50 pt-2 mt-1">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Informe Técnico</span>
              <p class="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/60">
                {{ infoEncontrada.detalles }}
              </p>
            </div>
          </div>

        </div>

      </div>

    </main>
  </div>
</template>