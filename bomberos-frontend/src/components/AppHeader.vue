<template>
  <header class="bg-red-800 text-white shadow-lg p-4 flex justify-between items-center">
    <!-- Lado Izquierdo: Usuario y Fecha -->
    <div class="flex flex-col">
      <span class="font-bold text-lg">Usuario: {{ userName }}</span>
      <span class="text-xs opacity-80">{{ currentDate }}</span>
    </div>

    <!-- Lado Derecho: Logo -->
    <div class="flex items-center gap-4">
      <img
        v-if="logoUrl"
        :src="logoUrl"
        alt="Dirección Nacional de Bomberos"
        class="h-10 w-auto"
        @error="logoUrl = null"
      />
      <span
        v-else
        class="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white font-black text-sm select-none"
        aria-hidden="true"
      >DNB</span>

      <AppButton variant="danger-outline" @click="handleLogout" aria-label="Cerrar sesión de usuario">
        SALIR
      </AppButton>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service';
import AppButton from './AppButton.vue';

const router = useRouter();
const userName = ref('Usuario'); 
const currentDate = ref('');
// TODO(3A-F): reemplazar por logo institucional DNB cuando exista el asset oficial
const logoUrl = ref(null);

onMounted(() => {
  const date = new Date();
  currentDate.value = date.toLocaleDateString('es-ES', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  // Cargar nombre real desde authService (userRole/JWT)
  const user = authService.getUser();
  if (user?.nombre) {
    userName.value = user.nombre;
  } else if (user?.email) {
    userName.value = user.email;
  } else {
    const role = authService.getUserRole();
    if (role) userName.value = role === 'EXTERNO' ? 'Usuario Externo' : role;
  }
});

const handleLogout = () => {
  authService.logout();
  router.push('/login');
};
</script>
