<template>
  <header class="bg-red-800 text-white shadow-lg p-4 flex justify-between items-center">
    <!-- Lado Izquierdo: Usuario y Fecha -->
    <div class="flex flex-col">
      <span class="font-bold text-lg">Usuario: {{ userName }}</span>
      <span class="text-xs opacity-80">{{ currentDate }}</span>
    </div>

    <!-- Lado Derecho: Logo -->
    <div class="flex items-center gap-4">
      <img src="#" alt="Logo Bomberos" class="h-10 w-auto" />
      
      <button 
        @click="handleLogout"
        class="bg-red-700 hover:bg-red-900 border border-white px-4 py-2 rounded-lg text-sm font-semibold transition"
      >
        SALIR
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service';

const router = useRouter();
const userName = ref('Usuario'); 
const currentDate = ref('');

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
