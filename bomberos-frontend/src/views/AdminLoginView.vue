<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600 mb-4 shadow-lg">
          <span class="text-white text-4xl">🚒</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">SIPPCI DNB</h1>
        <p class="text-slate-300 text-sm">Portal Institucional</p>
        <p class="text-slate-400 text-xs mt-1">Dirección Nacional de Bomberos</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Acceso Funcionarios</h2>
        <p class="text-sm text-slate-500 mb-6">
          Ingrese con sus credenciales institucionales para acceder al sistema.
        </p>

        <!-- Error -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <!-- Botón Kerberos principal -->
        <button
          @click="loginConKerberos"
          :disabled="cargando"
          class="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <svg v-if="!cargando" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span v-else class="animate-spin">⏳</span>
          {{ cargando ? 'Autenticando...' : 'Ingresar con Kerberos' }}
        </button>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-white text-slate-500">Credenciales institucionales</span>
          </div>
        </div>

        <!-- Formulario mock (para testing) -->
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">CI</label>
            <input
              v-model="form.ci"
              type="text"
              placeholder="9905200"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              @keyup.enter="loginMock"
            />
          </div>
          <button
            @click="loginMock"
            :disabled="cargando || !form.ci || !form.password"
            class="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Ingresar (modo prueba)
          </button>
        </div>

        <!-- Info -->
        <div class="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-xs text-blue-800">
            <strong>Modo simulación:</strong> Use CI <code class="bg-blue-100 px-1 rounded">9905200</code> y contraseña <code class="bg-blue-100 px-1 rounded">123456</code> para probar.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6">
        <RouterLink to="/login" class="text-slate-400 hover:text-white text-sm transition-colors">
          ← Volver al portal ciudadano
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { exchangeKerverosToken, loginMockKerveros, generateMockKerberosToken } from '../services/kerveros.service.js';

const router = useRouter();
const cargando = ref(false);
const error = ref('');

const form = ref({
  ci: '',
  password: '',
});

// Usuario ADMIN default para el botón "Ingresar con Kerberos" (simula SSO)
const ADMIN_DEFAULT = {
  ci: '9905200',
  email: 'admin.dnb@bomberos.gob.bo',
  nombre: 'ADMINISTRADOR SISTEMA DNB',
  rol: 'ADMIN',
  role: 'ADMIN',
  external_id: 'DNB-ADMIN-001',
};

async function guardarSesion(response) {
  localStorage.setItem('token', response.access_token);
  localStorage.setItem('user', JSON.stringify(response.user));
  localStorage.setItem('userRole', response.user.rol);
  localStorage.setItem('tipoUsuario', 'INTERNO');
}

async function loginConKerberos() {
  cargando.value = true;
  error.value = '';

  try {
    const mockToken = generateMockKerberosToken(ADMIN_DEFAULT);
    const response = await exchangeKerverosToken(mockToken);
    await guardarSesion(response);
    router.push('/admin/dashboard');
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Error al autenticar';
  } finally {
    cargando.value = false;
  }
}

async function loginMock() {
  cargando.value = true;
  error.value = '';

  try {
    const response = await loginMockKerveros(form.value.ci, form.value.password);
    await guardarSesion(response);
    router.push('/admin/dashboard');
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Credenciales inválidas';
  } finally {
    cargando.value = false;
  }
}
</script>