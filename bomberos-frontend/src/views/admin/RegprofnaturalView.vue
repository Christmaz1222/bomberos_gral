<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Menú Institucional -->
    <AppHeader />

    <main class="container mx-auto p-6">
      <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border-t-4 border-red-800">
        <h1 class="text-2xl font-bold text-red-800 mb-6 uppercase">Registro de Profesionales SIPPCI - Entidad Natural</h1>
        
        <form @submit.prevent="guardarRegistro" class="space-y-6">
          
          <!-- Sección: Entidad -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 class="col-span-full font-semibold text-gray-700 border-b pb-2">Datos de la Persona Natural</h2>
            <div class="field">
              <label class="block text-sm font-medium text-gray-700">Código del Sistema</label>
              <input v-model="form.codigo" class="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div class="field">
              <label class="block text-sm font-medium text-gray-700">Fecha de Solicitud</label>
              <input v-model="form.fechaSolicitud" type="date" class="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div class="field">
              <label class="block text-sm font-medium text-gray-700">NIT / CI</label>
              <input v-model="form.nit" class="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div class="field">
              <label class="block text-sm font-medium text-gray-700">Expedido</label>
              <input v-model="form.nit" class="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div class="field">
              <label class="block text-sm font-medium text-gray-700">Correo Electronico</label>
              <input v-model="form.email" type="email" class="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div class="field">
              <label class="block text-sm font-medium text-gray-700">Telefono Oficina/Celular</label>
              <input v-model="form.telefono" type="tel" class="w-full mt-1 p-2 border rounded-md" />
          </div>
        </div>
            <!-- Sección: Ubicación -->
         
            <section class="p-6 bg-white rounded-lg border border-gray-200">
                <h2 class="text-lg font-bold text-gray-800 mb-4">Selección de Ubicación</h2>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <select v-model="form.departamento" class="p-2 border rounded">
                    <option value="">Departamento</option>
                    <option value="LP">La Paz</option> <!-- Ejemplo -->
                </select>
                <select v-model="form.provincia" class="p-2 border rounded">
                    <option value="">Provincia</option>
                </select>
                <select v-model="form.municipio" class="p-2 border rounded">
                    <option value="">Municipio</option>
                </select>
                <input v-model="form.direccion" placeholder="Dirección exacta" class="p-2 border rounded col-span-2 md:col-span-1" />
                </div>

                <!-- Contenedor del Mapa -->
                <div id="map" class="h-64 w-full rounded-lg border-2 border-red-800"></div>
            </section>
          
            <!-- Sección: Educación -->

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h2 class="col-span-full font-semibold text-gray-700 border-b pb-2">Datos del Profesional</h2>
                <div class="field">
                    <label class="block text-sm font-medium text-gray-700">Nombre Completo del Profesional</label>
                    <input v-model="form.nombre" class="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div class="field">
                    <label class="block text-sm font-medium text-gray-700">Numero de C.I.</label>
                    <input v-model="form.ci" class="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div class="field">
                    <label class="block text-sm font-medium text-gray-700">Carrera</label>
                    <input v-model="form.carrera" class="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div class="field">
                    <label class="block text-sm font-medium text-gray-700">Nivel de Educacion</label>
                    <input v-model="form.educacion" class="w-full mt-1 p-2 border rounded-md" />
                </div>
             </div>              

          <!-- Sección: Pago y Cierre -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 class="col-span-full font-semibold text-gray-700 border-b pb-2">Detalles y Pago</h2>
            <input v-model="form.tipoCapacitacion" placeholder="Tipo de Capacitación" class="p-2 border rounded-md" />
            <input v-model="form.cantidad" type="number" placeholder="Cantidad de participantes" class="p-2 border rounded-md" />
            <input v-model="form.numDeposito" placeholder="Número de Depósito" class="p-2 border rounded-md" />
            <input v-model="form.fechaDeposito" type="date" class="p-2 border rounded-md" />
            <div class="col-span-full">
            <label class="block text-sm font-medium text-gray-700 mb-2">Adjuntar Comprobante</label>
            
            <!-- Área de Drag & Drop -->
            <div 
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            :class="[
                'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                isDragging ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-red-400'
            ]"
            >
            <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" />
            
            <div @click="$refs.fileInput.click()">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="mt-2 text-sm text-gray-600">
                <span class="font-bold text-red-800">Haz clic para buscar</span> o arrastra tu archivo aquí
                </p>
                <p class="text-xs text-gray-400 mt-1">PDF, JPG o PNG (Máx. 5MB)</p>
            </div>
            
            <!-- Mostrar nombre del archivo seleccionado -->
            <div v-if="fileName" class="mt-4 p-2 bg-white rounded border border-green-200 text-green-700 text-sm flex justify-between items-center">
                <span>{{ fileName }}</span>
                <button @click.stop="clearFile" class="text-red-500 font-bold">X</button>
            </div>
            </div>
        </div>
            <textarea v-model="form.observaciones" placeholder="Observaciones" class="col-span-full p-2 border rounded-md h-24"></textarea>
          </div>

          <button type="submit" class="w-full bg-red-800 text-white py-3 rounded-lg font-bold hover:bg-red-900 transition shadow-lg">
            REGISTRAR SOLICITUD
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import AppHeader from '../../components/AppHeader.vue';
import { onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ref } from 'vue';
import Swal from 'sweetalert2'; // 1. Importa SweetAlert2
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Mantenlo así
import QRCode from 'qrcode';


const form = reactive({
  codigo: '', fechaSolicitud: '', razonSocial: '', nit: '', entidad: '',
  responsable: '', ci: '', expedido: '', email: '', telefono: '',
  ciudad: '', departamento: '', provincia: '', municipio: '',
  tipoCapacitacion: '', cantidad: 0, numDeposito: '', fechaDeposito: '', observaciones: ''
});


onMounted(() => {
  // Asegúrate de que el div con id "map" exista en el DOM antes de esto
  const map = L.map('map').setView([-16.4897, -68.1193], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
});
const isDragging = ref(false);
const fileName = ref('');
const fileInput = ref(null);

const handleDrop = (e) => {
  isDragging.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) processFile(files[0]);
};

const handleFileChange = (e) => {
  if (e.target.files.length > 0) processFile(e.target.files[0]);
};

const processFile = (file) => {
  fileName.value = file.name;
  // Aquí emitirías el archivo a tu lógica de guardado
  console.log('Archivo listo para subir:', file);
};

const clearFile = () => {
  fileName.value = '';
  fileInput.value.value = '';
};
const guardarRegistro = async () => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¡Vas a registrar este formulario en el sistema!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#991b1b',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, guardar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      // 1. Aquí iría tu llamada a la API (axios/fetch)
      console.log('Guardando en BD...', form);
      
      // 2. Generar el PDF y obtener la URL (asegúrate que generarPDF tenga el 'return doc.output("bloburl")')
      const pdfUrl = await generarPDF();
      
      // 3. Alerta final con el PDF incrustado
      Swal.fire({
        title: '¡Éxito!',
        text: 'Formulario registrado y reporte generado.',
        icon: 'success',
        width: '800px',
        html: `
          <div style="height: 500px; width: 100%; margin-top: 20px;">
            <iframe src="${pdfUrl}" style="width:100%; height:100%; border:none;"></iframe>
          </div>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#991b1b'
      });
      
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema al guardar los datos o generar el PDF.', 'error');
    }
  }
};
const generarPDF = async () => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Formulario de Capacitacion SIPPCI', 20, 20);
  
  const datos = [
    ['Codigo', form.codigo],
    ['Razon Social', form.razonSocial],
    ['NIT/CI', form.nit],
    ['Responsable', form.responsable]
  ];
  
  // CORRECCIÓN AQUÍ: Usamos la función importada pasando 'doc' como primer argumento
  autoTable(doc, {
    startY: 30,
    body: datos,
  });

  const qrData = `Codigo: ${form.codigo} | Entidad: ${form.entidad}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrData);
  
  doc.addImage(qrCodeDataUrl, 'PNG', 150, 150, 40, 40);
  doc.text('Validacion QR', 150, 200);

  return doc.output('bloburl');
};

</script>
<style>
/* Asegúrate de importar el CSS de leaflet en tu main.js o aquí mismo */
@import 'leaflet/dist/leaflet.css';
#map {
  width: 100%;
  height: 300px; /* O usa la clase h-64 de Tailwind */
  z-index: 0;    /* Importante para que no se oculte detrás de otros elementos */
}
</style>