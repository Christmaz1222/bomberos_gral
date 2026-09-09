<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { kerverosService } from '../services/kerveros.service.js';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const error = ref('');
const success = ref(false);
const progress = ref(0);
const step = ref('validando'); // 'validando' | 'intercambiando' | 'completado' | 'error'

const steps = [
  { id: 'validando', label: 'Validando token Kerveros', icon: '🔍' },
  { id: 'intercambiando', label: 'Intercambiando por JWT SIPPCI', icon: '🔄' },
  { id: 'completado', label: 'Redirigiendo al dashboard', icon: '✅' }
];

onMounted(async () => {
  const token = route.query.token;
  
  if (!token) {
    error.value = 'No se recibió token de Kerveros';
    step.value = 'error';
    loading.value = false;
    return;
  }

  try {
    // Paso 1: Validando
    step.value = 'validando';
    progress.value = 30;
    await new Promise(r => setTimeout(r, 500));

    // Paso 2: Intercambiando
    step.value = 'intercambiando';
    progress.value = 60;
    
    const response = await kerverosService.exchangeKerverosToken(token);
    
    // Paso 3: Completado
    step.value = 'completado';
    progress.value = 100;
    success.value = true;
    
    await new Promise(r => setTimeout(r, 800));
    
    // Redirigir al dashboard admin
    router.push('/admin/dashboard');
  } catch (err) {
    step.value = 'error';
    progress.value = 0;
    error.value = err.message || 'Error al procesar el token de Kerveros';
    console.error('Kerveros callback error:', err);
  } finally {
    loading.value = false;
  }
});

const getStepStatus = (stepId) => {
  const currentIndex = steps.findIndex(s => s.id === step.value);
  const stepIndex = steps.findIndex(s => s.id === stepId);
  
  if (step.value === 'error') return stepId === 'error' ? 'current' : 'completed';
  if (step.value === 'completado') return 'completed';
  
  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'pending';
};

const retry = () => {
  error.value = '';
  step.value = 'validando';
  progress.value = 0;
  loading.value = true;
  // Reintentar con el mismo token
  onMounted();
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/30 flex items-center justify-center p-4">
    
    <!-- Fondo decorativo -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>

    <div class="relative w-full max-w-md">
      
      <!-- Tarjeta principal -->
      <div class="bg-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <div :class="['w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg', 
            step === 'error' ? 'bg-rose-600/20 border border-rose-500/30' : 
            step === 'completado' ? 'bg-emerald-600/20 border border-emerald-500/30' : 
            'bg-blue-600/20 border border-blue-500/30 animate-pulse-ring']">
            <span class="text-3xl">{{ step === 'error' ? '❌' : step === 'completado' ? '✅' : '🔄' }}</span>
          </div>
          
          <h1 class="text-2xl font-black text-white tracking-tight mb-2">
            {{ step === 'error' ? 'Error de Autenticación' : step === 'completado' ? '¡Autenticación Exitosa!' : 'Procesando Autenticación' }}
          </h1>
          
          <p class="text-slate-400 text-sm">
            {{ step === 'error' ? 'No se pudo validar el token de Kerveros' : 
              step === 'completado' ? 'Redirigiendo al panel de control...' : 
              'Intercambiando credenciales con el backend SIPPCI' }}
          </p>
        </div>

        <!-- Barra de progreso -->
        <div class="mb-6">
          <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
          <p class="text-xs text-slate-500 text-center mt-2">{{ progress }}% completado</p>
        </div>

        <!-- Pasos -->
        <div class="space-y-3 mb-6">
          <div v-for="s in steps" :key="s.id" 
               :class="['flex items-center gap-3 p-3 rounded-lg transition-all', 
                 getStepStatus(s.id) === 'completed' ? 'bg-emerald-900/20 border border-emerald-500/30' : 
                 getStepStatus(s.id) === 'current' ? 'bg-blue-900/20 border border-blue-500/30' : 
                 'bg-slate-800/50 border border-slate-700/50']">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0', 
              getStepStatus(s.id) === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 
              getStepStatus(s.id) === 'current' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 
              'bg-slate-700/50 text-slate-500']">
              <span v-if="getStepStatus(s.id) === 'completed'" class="text-xl">✓</span>
              <span v-else>{{ s.icon }}</span>
            </div>
            <div class="flex-1">
              <p :class="['text-sm font-medium', 
                getStepStatus(s.id) === 'completed' ? 'text-emerald-300' : 
                getStepStatus(s.id) === 'current' ? 'text-blue-300' : 
                'text-slate-400']">
                {{ s.label }}
              </p>
            </div>
            <div v-if="getStepStatus(s.id) === 'current' && step !== 'error' && step !== 'completado'" 
                 class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <svg v-if="getStepStatus(s.id) === 'completed'" class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Paso de error si aplica -->
          <div v-if="step === 'error'" class="p-3 bg-rose-900/30 border border-rose-600/30 rounded-lg flex items-center gap-3 animate-shake">
            <svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <p class="text-rose-300 font-medium text-sm">Error</p>
              <p class="text-rose-200 text-xs mt-0.5">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Mensaje de éxito con animación -->
        <div v-if="step === 'completado'" class="text-center py-4 animate-bounce-in">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 rounded-full text-sm font-semibold">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sesión iniciada correctamente
          </div>
        </div>

        <!-- Botones de acción -->
        <div v-if="step === 'error'" class="flex flex-col sm:flex-row gap-3">
          <button @click="retry" class="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold rounded-lg hover:from-red-700 hover:to-rose-600 transition-all">
            Reintentar
          </button>
          <button @click="() => router.push('/auth/kerveros')" class="flex-1 py-3 bg-slate-800 border border-slate-600 text-slate-300 font-bold rounded-lg hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all">
            Volver al Login
          </button>
        </div>
      </div>

      <!-- Info inferior -->
      <div class="mt-6 text-center text-[10px] text-slate-600 uppercase tracking-wider">
        <p>Dirección Nacional de Bomberos • Policía Boliviana</p>
        <p class="mt-1">SIPPCI - Sistema Integrado de Prevención y Control de Incendios</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.8); }
  50% { transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}

.animate-bounce-in {
  animation: bounce-in 0.5s ease-out;
}
</style>