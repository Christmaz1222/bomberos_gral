<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const codigoBusqueda = ref('');
const empresaJuridica = ref(null);
const mensajeError = ref('');
const cargando = ref(false);

const buscarEmpresaJuridica = async () => {
  if (!codigoBusqueda.value) return;
  
  cargando.value = true;
  mensajeError.value = '';
  empresaJuridica.value = null;

  try {
    // Aquí tu endpoint real con fetch/axios a NestJS
    // const respuesta = await fetch(`/api/empresas/${codigoBusqueda.value}`);
    // const data = await respuesta.json();

    // Data de prueba
    const data = {
      id: 99,
      codigo: codigoBusqueda.value,
      razon_social: 'Servicios Contra Incendios S.R.L.',
      estado: codigoBusqueda.value === '12345' ? 'ACTIVA' : 'INACTIVA' 
    };

    if (data.estado !== 'ACTIVA') {
      mensajeError.value = `La empresa con código ${codigoBusqueda.value} se encuentra ${data.estado}.`;
      return;
    }

    empresaJuridica.value = data;
  } catch (error) {
    mensajeError.value = 'Error al buscar el código.';
  } finally {
    cargando.value = false;
  }
};

const irAlRegistro = () => {
  // Redirige al formulario y pasa el ID en la URL (?empresa_id=99)
  router.push({ 
    name: 'certificacion-pn', 
    query: { empresa_id: empresaJuridica.value.id } 
  });
};
</script>

<template>
  <div style="padding: 2rem;">
    <h2>1. Validar Empresa Jurídica</h2>
    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
      <input 
        v-model="codigoBusqueda" 
        type="text" 
        placeholder="Ingrese Código SIPPCI Jurídico"
      />
      <button @click="buscarEmpresaJuridica" :disabled="cargando">
        {{ cargando ? 'Buscando...' : 'Buscar' }}
      </button>
    </div>
    
    <p v-if="mensajeError" style="color: red; margin-top: 1rem;">{{ mensajeError }}</p>

    <div v-if="empresaJuridica" style="margin-top: 1rem; border: 1px solid green; padding: 1rem;">
      <p><strong>✓ Empresa Encontrada:</strong> {{ empresaJuridica.razon_social }}</p>
      <p><strong>Estado:</strong> {{ empresaJuridica.estado }}</p>
      
      <button @click="irAlRegistro" style="margin-top: 1rem; background: #004085; color: white;">
        Registrar Profesional para esta Empresa
      </button>
    </div>
  </div>
</template>