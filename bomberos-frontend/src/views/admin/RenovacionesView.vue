<template>
  <div class="min-h-screen bg-gray-100">
    <AppHeader />

    <main class="container mx-auto p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Módulo de Renovaciones</h1>

      <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-800">
        
        <div class="mb-6">
          <label class="block text-gray-700 font-bold mb-2">Seleccione el tipo de trámite:</label>
          <select 
            v-model="tipoRegistro" 
            class="w-full md:w-1/2 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-red-800"
          >
            <option value="" disabled>-- Seleccione una opción --</option>
            <option value="prof_natural">1. Profesional Natural</option>
            <option value="prof_juridica">2. Profesional Jurídica</option>
            <option value="decl_jurada">3. Declaración Jurada</option>
            <option value="cert_natural">4. Certificación Natural</option>
            <option value="cert_juridica">5. Certificación Jurídica</option>
          </select>
        </div>

        <div class="mb-6" v-if="tipoRegistro">
          <label class="block text-gray-700 font-bold mb-2">Buscar por código de sistema:</label>
          <div class="flex gap-2 w-full md:w-1/2">
            <input 
              v-model="codigoBusqueda" 
              type="text" 
              placeholder="Ingrese el código del sistema" 
              class="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-red-800"
            />
            <button 
              @click="buscarRegistro" 
              :disabled="cargando || !codigoBusqueda"
              class="bg-red-800 hover:bg-red-900 text-white px-6 py-2 rounded transition disabled:opacity-50"
            >
              {{ cargando ? 'Buscando...' : 'Buscar' }}
            </button>
          </div>
        </div>

        <div v-if="resultado" class="mt-8 border-t pt-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Información del Registro</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded border">
            <div><span class="font-bold text-gray-600">Paterno:</span> {{ resultado.paterno }}</div>
            <div><span class="font-bold text-gray-600">Materno:</span> {{ resultado.materno }}</div>
            <div><span class="font-bold text-gray-600">Nombres:</span> {{ resultado.nombres }}</div>
            <div><span class="font-bold text-gray-600">CI:</span> {{ resultado.ci }}</div>
            <div><span class="font-bold text-gray-600">Expedido:</span> {{ resultado.exp }}</div>
            <div><span class="font-bold text-gray-600">Correo:</span> {{ resultado.correo }}</div>
            <div><span class="font-bold text-gray-600">Celular:</span> {{ resultado.celular }}</div>
            <div><span class="font-bold text-gray-600">Departamento:</span> {{ resultado.departamento }}</div>
            <div><span class="font-bold text-gray-600">Provincia:</span> {{ resultado.provincia }}</div>
            <div><span class="font-bold text-gray-600">Municipio:</span> {{ resultado.municipio }}</div>
            <div><span class="font-bold text-gray-600">Ciudad:</span> {{ resultado.ciudad }}</div>
            <div><span class="font-bold text-gray-600">Num. Depósito:</span> {{ resultado.num_deposito }}</div>
            <div><span class="font-bold text-gray-600">Fecha Registro:</span> {{ resultado.fecha_registro }}</div>
          </div>

          <div class="flex justify-end mt-4">
            <button 
              @click="procesarRenovacion" 
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded shadow-lg transition transform hover:scale-105"
            >
              Renovar
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import AppHeader from '../../components/AppHeader.vue';

const tipoRegistro = ref('');
const codigoBusqueda = ref('');
const cargando = ref(false);
const resultado = ref(null);

const buscarRegistro = async () => {
  cargando.value = true;
  resultado.value = null;

  try {
    setTimeout(() => {
      resultado.value = {
        paterno: 'Mamani',
        materno: 'Condori',
        nombres: 'Juan Perez',
        ci: '1234567',
        exp: 'LP',
        correo: 'juan.perez@email.com',
        celular: '77712345',
        departamento: 'La Paz',
        provincia: 'Murillo',
        municipio: 'Nuestra Señora de La Paz',
        ciudad: 'La Paz',
        num_deposito: 'DEP-987654321',
        fecha_registro: '2024-05-15'
      };
      cargando.value = false;
    }, 800);

  } catch (error) {
    cargando.value = false;
    Swal.fire('Error', 'No se encontró el registro.', 'error');
  }
};

const procesarRenovacion = () => {
  Swal.fire({
    title: '¡Renovación Exitosa!',
    text: `La renovación del código ${codigoBusqueda.value} se renovará por dos años más.`,
    icon: 'success',
    confirmButtonColor: '#166534',
    confirmButtonText: 'Aceptar'
  }).then((result) => {
    if (result.isConfirmed) {
      resultado.value = null;
      codigoBusqueda.value = '';
      tipoRegistro.value = '';
    }
  });
};
</script>