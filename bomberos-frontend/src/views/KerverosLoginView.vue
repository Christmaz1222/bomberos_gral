<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { kerverosService } from '../services/kerveros.service.js';

const router = useRouter();

const form = reactive({
  ci: '',
  password: ''
});

const loading = ref(false);
const error = ref('');
const showCredentials = ref(false);

// Verificar si ya hay sesión Kerveros activa
onMounted(() => {
  const kerverosUser = kerverosService.getKerverosUserData();
  if (kerverosUser) {
    router.push('/auth/kerveros/dashboard');
  }
});

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    if (!form.ci || !form.password) {
      throw { message: 'Complete todos los campos' };
    }

    await kerverosService.loginKerveros(form.ci, form.password);
    router.push('/auth/kerveros/dashboard');
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión en Kerveros';
  } finally {
    loading.value = false;
  }
};

const toggleCredentials = () => {
  showCredentials.value = !showCredentials.value;
};

const fillCredentials = (user) => {
  form.ci = user.ci;
  form.password = user.password;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/30 flex items-center justify-center p-4">
    
    <!-- Fondo decorativo -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>

    <!-- Tarjeta de Login -->
    <div class="relative w-full max-w-md bg-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 class="text-2xl font-black text-white tracking-tight">KERVEROS</h1>
        <p class="text-slate-400 text-sm mt-1">Autenticación Policía Boliviana</p>
        <p class="text-slate-500 text-xs mt-2">Sistema Integrado SIPPCI - Bomberos</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="mb-5 p-3 bg-rose-900/30 border border-rose-600/30 rounded-lg text-rose-200 text-sm flex items-center gap-2 animate-shake">
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        {{ error }}
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- CI -->
        <div>
          <label for="ci" class="block text-xs font-semibold text-slate-300 mb-1.5 tracking-wide">CARNET DE IDENTIDAD</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <input
              id="ci"
              v-model="form.ci"
              type="text"
              maxlength="15"
              placeholder="Ej: 9905200"
              class="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
              :disabled="loading"
              autocomplete="username"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-xs font-semibold text-slate-300 mb-1.5 tracking-wide">CONTRASEÑA</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="••••••"
              class="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
              :disabled="loading"
              autocomplete="current-password"
            />
          </div>
        </div>

        <!-- Botón Ingresar -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-red-500/25 hover:from-red-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{{ loading ? 'Autenticando...' : 'INGRESAR A KERVEROS' }}</span>
        </button>
      </form>

      <!-- Credenciales de prueba (Solo desarrollo) -->
      <div v-if="showCredentials" class="mt-6 pt-6 border-t border-slate-700 animate-fade-in">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Credenciales de Prueba (Desarrollo)</h3>
          <button @click="toggleCredentials" class="text-xs text-slate-500 hover:text-slate-300">Ocultar</button>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          <div v-for="user in kerverosService.getMockUsers()" :key="user.ci" 
               @click="fillCredentials(user)"
               class="p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:border-red-500/50 hover:bg-slate-800 transition-all text-left">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-white">{{ user.nombre }}</span>
              <span class="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded">{{ user.grado }}</span>
            </div>
            <p class="text-[10px] text-slate-400">{{ user.unidad }}</p>
            <div class="flex gap-2 mt-1.5 text-[10px] font-mono">
              <span class="text-slate-300">CI: <span class="text-white">{{ user.ci }}</span></span>
              <span class="text-slate-300">Pass: <span class="text-amber-300">{{ user.password }}</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Toggle credenciales -->
      <button @click="toggleCredentials" class="mt-4 w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors">
        <span v-if="showCredentials">Ocultar credenciales de prueba</span>
        <span v-else>Mostrar credenciales de prueba (Desarrollo)</span>
      </button>

      <!-- Badge simulación -->
      <div class="mt-6 text-center">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/30 border border-amber-600/30 text-amber-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
          <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
          MODO SIMULACIÓN - Solo Desarrollo
        </span>
      </div>

      <!-- Badge requerido por guía Fase Autoverificación -->
      <div class="mt-2 text-center">
        <div class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full inline-block">
          🔧 Modo Desarrollo - Simulación
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center text-[10px] text-slate-600 uppercase tracking-wider">
        Dirección Nacional de Bomberos • Policía Boliviana
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

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>