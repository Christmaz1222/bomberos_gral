<template>
  <div class="min-h-screen bg-gray-100 relative pb-10">
    <AppHeader />

    <main class="container mx-auto p-6">
      
      <!-- SECCIÓN SIPPCI -->
      <div class="mb-12">
        <h1 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Módulos de Registro SIPPCI</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="item in formularios" 
            :key="item.id"
            @click="manejarClic(item)"
            class="bg-white p-6 rounded-lg shadow border-b-4 border-red-800 hover:shadow-xl transition cursor-pointer hover:bg-red-50 group"
          >
            <div class="text-3xl mb-4 group-hover:scale-110 transition-transform">📋</div>
            <h3 class="font-bold text-gray-800 text-lg mb-2">{{ item.title }}</h3>
            <p class="text-sm text-gray-500">Acceder al formulario de registro y gestión.</p>
          </div>
        </div>
      </div>

      <!-- SECCIÓN TURISMO -->
      <div>
        <h1 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Módulos de Turismo</h1>

        <!-- 1. Actividades Aéreas -->
        <h2 class="text-xl font-bold text-blue-800 mt-6 mb-4">1. Actividades Aéreas</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <div 
            v-for="item in turismoAereas" 
            :key="item.id"
            @click="manejarClic(item)"
            class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-lg transition cursor-pointer hover:bg-blue-50"
          >
            <div class="text-2xl mb-2">🪂</div>
            <h3 class="font-bold text-gray-800 text-md">{{ item.title }}</h3>
          </div>
        </div>

        <!-- 2. Actividades Acuáticas -->
        <h2 class="text-xl font-bold text-cyan-700 mb-4">2. Actividades Acuáticas</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <div 
            v-for="item in turismoAcuaticas" 
            :key="item.id"
            @click="manejarClic(item)"
            class="bg-white p-4 rounded-lg shadow border-l-4 border-cyan-500 hover:shadow-lg transition cursor-pointer hover:bg-cyan-50"
          >
            <div class="text-2xl mb-2">🌊</div>
            <h3 class="font-bold text-gray-800 text-md">{{ item.title }}</h3>
          </div>
        </div>

        <!-- 3. Actividades Terrestres -->
        <h2 class="text-xl font-bold text-green-700 mb-4">3. Actividades Terrestres</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="item in turismoTerrestres" 
            :key="item.id"
            @click="manejarClic(item)"
            class="bg-white p-4 rounded-lg shadow border-l-4 border-green-600 hover:shadow-lg transition cursor-pointer hover:bg-green-50"
          >
            <div class="text-2xl mb-2">🧗</div>
            <h3 class="font-bold text-gray-800 text-md">{{ item.title }}</h3>
          </div>
        </div>
      </div>

    </main>

    <!-- Modal Buscador Persona Jurídica -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button @click="cerrarModal" class="absolute top-4 right-4 text-gray-500 hover:text-red-600 font-bold text-xl">
          ✕
        </button>
        
        <h2 class="text-xl font-bold text-gray-800 mb-4">Validar Empresa Jurídica</h2>
        <p class="text-sm text-gray-600 mb-4">Ingrese el código de la entidad jurídica para asociar el registro.</p>

        <div class="flex gap-2 mb-4">
          <input
            v-model="codigoBusqueda"
            type="text"
            placeholder="Ej: 12345"
            :disabled="empresaJuridica !== null"
            class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-800"
          />
          <button
            @click="buscarEmpresaJuridica"
            :disabled="cargando || empresaJuridica !== null"
            class="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded transition disabled:opacity-50"
          >
            {{ cargando ? 'Buscando...' : 'Buscar' }}
          </button>
        </div>

        <p v-if="mensajeError" class="text-red-600 text-sm mb-4">{{ mensajeError }}</p>

        <div v-if="empresaJuridica" class="bg-green-50 border border-green-200 rounded p-4 mb-4">
          <p class="text-green-800"><strong>✓ Empresa Vinculada:</strong> {{ empresaJuridica.razon_social }}</p>
          <p class="text-green-800 text-sm mt-1"><strong>Estado:</strong> <span class="font-bold">{{ empresaJuridica.estado }}</span></p>
        </div>

        <div class="flex justify-between items-center mt-6">
          <button 
            @click="continuarSinEmpresa" 
            class="px-4 py-2 text-blue-600 border border-blue-600 hover:bg-blue-50 rounded transition"
          >
            Registro sin empresa
          </button>

          <div class="flex gap-2">
            <button 
              v-if="empresaJuridica"
              @click="reiniciarBusqueda" 
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              Cambiar Empresa
            </button>
            <button 
              v-if="empresaJuridica"
              @click="continuarAlRegistro" 
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition shadow"
            >
              Continuar al Formulario
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '../../components/AppHeader.vue';

const router = useRouter();

// ARRAYS DE DATOS
const formularios = ref([
  { id: 1, title: 'Registro Capacitación SIPPCI – Persona Jurídica', route: '/admin/capacitacion-pj' },
  { id: 2, title: 'Registro Certificaciones SIPPCI – Entidad Natural', route: '/admin/certificacion-pn', requiereValidacion: true },
  { id: 3, title: 'Registro Certificación SIPPCI – Entidad Jurídica', route: '/admin/certificacion-pj' },
  { id: 4, title: 'Declaración Jurada', route: '/admin/declaracion-jurada' },
  { id: 5, title: 'Registro Profesionales SIPPCI – Persona Natural', route: '/admin/profesionales-pn' },
  { id: 6, title: 'Registro Profesionales SIPPCI – Personas Jurídicas', route: '/admin/profesionales-pj' },
  { id: 7, title: 'Renovaciones – Personas Naturales', route: '/admin/renovaciones-pn' }
]);

const turismoAereas = ref([
  { id: 'a1', title: 'Alas Delta', route: '/admin/alas-delta' },
  { id: 'a2', title: 'CANOPY', route: '/admin/canopy' },
  { id: 'a3', title: 'Parapente', route: '/admin/parapente' }
]);

const turismoAcuaticas = ref([
  { id: 'ac1', title: 'Banano Flotante', route: '/admin/turismo/acuaticas/banano' },
  { id: 'ac2', title: 'BOYA', route: '/admin/turismo/acuaticas/boya' },
  { id: 'ac3', title: 'BUCEO', route: '/admin/turismo/acuaticas/buceo' },
  { id: 'ac4', title: 'KAYAK de Río', route: '/admin/turismo/acuaticas/kayak' },
  { id: 'ac5', title: 'RAFTING', route: '/admin/turismo/acuaticas/rafting' },
  { id: 'ac6', title: 'SNORKEL', route: '/admin/turismo/acuaticas/snorkel' },
  { id: 'ac7', title: 'TUBING', route: '/admin/turismo/acuaticas/tubing' }
]);

const turismoTerrestres = ref([
  { id: 't1', title: 'Cabalgata', route: '/admin/terrestres/cabalgata' },
  { id: 't2', title: 'Ascensos y Descensos (CANYONING)', route: '/admin/terrestres/canyoning' },
  { id: 't3', title: 'Ciclo Turismo', route: '/admin/terrestres/ciclo-turismo' },
  { id: 't4', title: 'Escalada', route: '/admin/terrestres/escalada' },
  { id: 't5', title: 'Exploración de Cuevas', route: '/admin/terrestres/cuevas' },
  { id: 't6', title: 'Senderismo', route: '/admin/terrestres/senderismo' }
]);

// LÓGICA DEL MODAL
const mostrarModal = ref(false);
const codigoBusqueda = ref('');
const empresaJuridica = ref(null);
const mensajeError = ref('');
const cargando = ref(false);
const rutaDestino = ref('');

const manejarClic = (item) => {
  if (item.requiereValidacion) {
    rutaDestino.value = item.route;
    mostrarModal.value = true;
  } else {
    router.push(item.route);
  }
};

const cerrarModal = () => {
  mostrarModal.value = false;
  reiniciarBusqueda();
};

const reiniciarBusqueda = () => {
  codigoBusqueda.value = '';
  empresaJuridica.value = null;
  mensajeError.value = '';
};

const buscarEmpresaJuridica = async () => {
  if (!codigoBusqueda.value) return;

  cargando.value = true;
  mensajeError.value = '';
  empresaJuridica.value = null;

  try {
    const data = {
      id: 99,
      codigo: codigoBusqueda.value,
      razon_social: 'Empresa Demo S.R.L.',
      estado: codigoBusqueda.value === '12345' ? 'ACTIVA' : 'INACTIVA'
    };

    if (data.estado !== 'ACTIVA') {
      mensajeError.value = `La empresa con código ${codigoBusqueda.value} se encuentra ${data.estado}.`;
      return;
    }

    empresaJuridica.value = data;
  } catch (error) {
    mensajeError.value = 'Error al validar el código. Verifique la conexión.';
  } finally {
    cargando.value = false;
  }
};

const continuarAlRegistro = () => {
  router.push({
    path: rutaDestino.value,
    query: { empresa_id: empresaJuridica.value.id }
  });
};

const continuarSinEmpresa = () => {
  router.push({
    path: rutaDestino.value
  });
};
</script>