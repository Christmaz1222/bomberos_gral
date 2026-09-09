<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { kerverosService } from '../services/kerveros.service.js';

const router = useRouter();

const user = ref(null);
const loading = ref(true);
const showSimulationBadge = ref(true);

// Aplicaciones disponibles en Kerveros
const aplicaciones = [
  {
    id: 'sippci',
    nombre: 'SIPPCI',
    descripcion: 'Sistema Integrado de Prevención y Control de Incendios',
    icon: '🚒',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    destacado: true,
    badge: 'PRINCIPAL',
    badgeColor: 'bg-emerald-500 text-emerald-900',
    ruta: null // Se maneja con click especial
  },
  {
    id: 'siges',
    nombre: 'SIGES',
    descripcion: 'Sistema de Gestión de Emergencias y Siniestros',
    icon: '🚨',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    destacado: false,
    badge: 'EMERGENCIAS',
    badgeColor: 'bg-red-500 text-red-900',
    ruta: 'https://kerveros-dev.policia.bo/siges'
  },
  {
    id: 'siap',
    nombre: 'SIAP',
    descripcion: 'Sistema de Administración de Personal Policial',
    icon: '👮',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    destacado: false,
    badge: 'PERSONAL',
    badgeColor: 'bg-blue-500 text-blue-900',
    ruta: 'https://kerveros-dev.policia.bo/siap'
  },
  {
    id: 'sireg',
    nombre: 'SIREG',
    descripcion: 'Sistema de Registro y Estadísticas',
    icon: '📊',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    destacado: false,
    badge: 'ESTADÍSTICAS',
    badgeColor: 'bg-amber-500 text-amber-900',
    ruta: 'https://kerveros-dev.policia.bo/sireg'
  },
  {
    id: 'sica',
    nombre: 'SICA',
    descripcion: 'Sistema de Capacitación y Adiestramiento',
    icon: '🎓',
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    textColor: 'text-violet-400',
    destacado: false,
    badge: 'CAPACITACIÓN',
    badgeColor: 'bg-violet-500 text-violet-900',
    ruta: 'https://kerveros-dev.policia.bo/sica'
  },
  {
    id: 'sira',
    nombre: 'SIRA',
    descripcion: 'Sistema de Recursos y Activos',
    icon: '🏗️',
    color: 'from-slate-500 to-slate-600',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-400',
    destacado: false,
    badge: 'RECURSOS',
    badgeColor: 'bg-slate-500 text-slate-900',
    ruta: 'https://kerveros-dev.policia.bo/sira'
  }
];

const appPrincipal = computed(() => aplicaciones.find(a => a.destacado));
const otrasApps = computed(() => aplicaciones.filter(a => !a.destacado));

onMounted(async () => {
  // Verificar sesión Kerveros
  const kerverosUser = kerverosService.getKerverosUserData();
  
  if (!kerverosUser) {
    router.push('/auth/kerveros');
    return;
  }

  user.value = kerverosUser;
  loading.value = false;
  
  // Ocultar badge simulación después de 5 segundos
  setTimeout(() => {
    showSimulationBadge.value = false;
  }, 5000);
});

const handleSippciClick = async () => {
  if (!appPrincipal.value) return;
  
  // Generar token mock y redirigir al callback
  const mockToken = kerverosService._generateMockKerverosToken({
    ci: user.value.ci,
    nombre: user.value.nombre,
    grado: user.value.grado,
    unidad: user.value.unidad,
    email: user.value.email,
    role: user.value.role
  });
  
  // Redirigir al callback con el token
  router.push(`/auth/kerveros/callback?token=${encodeURIComponent(mockToken)}`);
};

const handleExternalAppClick = (app) => {
  if (app.ruta) {
    window.open(app.ruta, '_blank', 'noopener,noreferrer');
  }
};

const handleLogout = () => {
  kerverosService.logoutKerveros();
  router.push('/auth/kerveros');
};

const getRolBadge = (role) => {
  switch (role) {
    case 'ADMIN': return { label: 'ADMINISTRADOR', color: 'bg-amber-500 text-amber-900' };
    case 'INTERNO': return { label: 'PERSONAL INTERNO', color: 'bg-blue-500 text-blue-900' };
    default: return { label: role, color: 'bg-slate-500 text-slate-900' };
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20">
    
    <!-- Fondo decorativo -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/95">
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
        <p class="text-slate-400 text-sm">Cargando dashboard...</p>
      </div>
    </div>

    <div v-else class="relative">
      <!-- Header -->
      <header class="relative z-10 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <!-- Logo y título -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-black text-white tracking-tight">KERVEROS</h1>
                <p class="text-slate-400 text-xs">Dashboard de Aplicaciones - Policía Boliviana</p>
              </div>
            </div>

            <!-- Usuario y acciones -->
            <div class="flex items-center gap-4">
              <div class="hidden sm:block text-right">
                <p class="text-xs text-slate-500 uppercase tracking-wider">Conectado como</p>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-white">{{ user?.nombre }}</span>
                  <span :class="['px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', getRolBadge(user?.role).color]">
                    {{ getRolBadge(user?.role).label }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span v-if="showSimulationBadge" class="px-2 py-1 bg-amber-900/30 border border-amber-600/30 text-amber-300 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                  SIMULACIÓN
                </span>
                <button @click="handleLogout" class="px-4 py-2 bg-slate-800 border border-slate-600 text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          <!-- Info usuario expandida (mobile) -->
          <div class="sm:hidden mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-4">
            <div class="bg-slate-800/50 rounded-lg p-3">
              <p class="text-[10px] text-slate-500 uppercase tracking-wider">GRADO</p>
              <p class="font-semibold text-white">{{ user?.grado }}</p>
            </div>
            <div class="bg-slate-800/50 rounded-lg p-3">
              <p class="text-[10px] text-slate-500 uppercase tracking-wider">UNIDAD</p>
              <p class="font-semibold text-white text-sm truncate">{{ user?.unidad }}</p>
            </div>
            <div class="bg-slate-800/50 rounded-lg p-3">
              <p class="text-[10px] text-slate-500 uppercase tracking-wider">CI</p>
              <p class="font-semibold text-white font-mono">{{ user?.ci }}</p>
            </div>
            <div class="bg-slate-800/50 rounded-lg p-3">
              <p class="text-[10px] text-slate-500 uppercase tracking-wider">EMAIL</p>
              <p class="font-semibold text-white text-sm truncate">{{ user?.email }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenido Principal -->
      <main class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Tarjeta de bienvenida -->
        <div class="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p class="text-slate-400 text-sm mb-1">Bienvenido,</p>
              <h2 class="text-2xl sm:text-3xl font-black text-white">{{ user?.nombre }}</h2>
              <p class="text-slate-400 text-sm mt-1">{{ user?.grado }} • {{ user?.unidad }}</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
                🚒
              </div>
            </div>
          </div>
        </div>

        <!-- Aplicación Principal (SIPPCI) -->
        <div class="mb-8">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            Aplicación Principal
          </h3>
          
          <div v-if="appPrincipal" class="group relative">
            <button 
              @click="handleSippciClick"
              class="w-full relative overflow-hidden bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-emerald-400 hover:from-emerald-900/50 hover:to-emerald-800/50 transition-all duration-300 cursor-pointer"
            >
              <!-- Contenido principal -->
              <div class="flex items-center gap-6 flex-1">
                <div :class="['w-20 h-20 rounded-2xl flex items-center justify-center text-4xl', appPrincipal.value.bgColor]">
                  {{ appPrincipal.value.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-black text-white">{{ appPrincipal.value.nombre }}</h3>
                    <span :class="['px-3 py-1 rounded-full text-[10px] font-bold uppercase', appPrincipal.value.badgeColor]">
                      {{ appPrincipal.value.badge }}
                    </span>
                  </div>
                  <p class="text-slate-300 text-sm">{{ appPrincipal.value.descripcion }}</p>
                  <div class="mt-3 flex items-center gap-2 text-slate-500 text-xs">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Acceder al sistema SIPPCI</span>
                    <svg class="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Badge destacado -->
              <div class="absolute top-4 right-4">
                <span class="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  DESTACADO
                </span>
              </div>

              <!-- Efecto brillo hover -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </button>
          </div>
        </div>

        <!-- Otras aplicaciones -->
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Otras Aplicaciones Kerveros
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="app in otrasApps" :key="app.id"
                 @click="handleExternalAppClick(app)"
                 class="group relative bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-800 transition-all duration-300 cursor-pointer"
            >
              <div class="flex items-start gap-4">
                <div :class="['w-12 h-12 rounded-xl flex items-center justify-center text-2xl', app.bgColor]">
                  {{ app.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-bold text-white">{{ app.nombre }}</h4>
                    <span :class="['px-2 py-0.5 rounded-full text-[9px] font-bold uppercase', app.badgeColor]">
                      {{ app.badge }}
                    </span>
                  </div>
                  <p class="text-slate-400 text-xs line-clamp-2">{{ app.descripcion }}</p>
                  <div class="mt-3 flex items-center gap-1 text-slate-500 text-[10px]">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Abrir en nueva pestaña</span>
                  </div>
                </div>
              </div>
              <!-- Flecha externa -->
              <svg class="absolute top-4 right-4 w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Animación de entrada suave */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Efecto de brillo en la tarjeta principal */
button:hover {
  animation: pulse-ring 2s infinite;
}
</style>