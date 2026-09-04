<script setup>
import { reactive } from 'vue';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// ⚠️ Ajusta esta ruta según la ubicación exacta de tu componente
import AppHeader from '../../components/AppHeader.vue';

const form = reactive({
  numeroTuristas: '',
  edadMinima: '',
  pesoAltura: '',
  turista: { casco: false, paracaidas: false, mosqueton: false, vestimenta: false },
  piloto: { casco: false, paracaidas: false, mosqueton: false, botiquin: false, comunicacion: false, vestimenta: false, guante: false, anemometro: false, gps: false },
  equipo: { mangaViento: false, biplaza: false, transporte: false, persona: false, brujula: false, altivario: false, bengala: false, agua: false, manta: false, extintores: false, botiquin: false, otros: false },
  otrosDescripcion: ''
});

const generarPDF = async () => {
  const doc = new jsPDF();
  
  // Título del Documento
  doc.setFontSize(22);
  doc.setTextColor(30, 64, 175);
  doc.text("Certificado de Registro: Alas Delta", 20, 20);

  // Datos Generales
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Número de Turistas: ${form.numeroTuristas || 'N/A'}`, 20, 40);
  doc.text(`Edad Mínima: ${form.edadMinima || 'N/A'}`, 20, 50);
  doc.text(`Peso y Altura: ${form.pesoAltura || 'N/A'}`, 20, 60);

  // Fecha de Emisión
  const fecha = new Date().toLocaleDateString();
  doc.text(`Fecha de Registro: ${fecha}`, 20, 70);

  // Generación del Código QR
  const qrData = `VALIDACION SIPPCI\nActividad: Alas Delta\nTuristas: ${form.numeroTuristas}\nFecha: ${fecha}`;
  
  try {
    const qrImageBase64 = await QRCode.toDataURL(qrData, {
      width: 100,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    });
    doc.addImage(qrImageBase64, 'PNG', 150, 30, 40, 40);
  } catch (err) {
    console.error('Error generando el QR: ', err);
  }

  return doc.output('datauristring');
};

const guardarFormulario = () => {
  Swal.fire({
    title: '¿Está seguro?',
    text: "¿Desea guardar el registro y generar el PDF?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#166534',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, generar PDF',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      
      // Iniciamos el Loading sin botones
      Swal.fire({
        title: 'Generando Documento...',
        text: 'Procesando el código QR y la estructura.',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const pdfDataUri = await generarPDF();

      // Alerta final con el PDF y el botón "OK" (Forzamos a que desaparezca el loading)
      Swal.fire({
        title: '¡Generado!',
        html: `
          <p class="mb-4 text-gray-600">El PDF con el código QR ha sido descargado exitosamente.</p>
          <iframe src="${pdfDataUri}" width="100%" height="450px" class="border border-gray-300 rounded shadow-inner"></iframe>
        `,
        icon: 'success',
        width: '800px',
        showConfirmButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#166534'
      }).then(() => {
        console.log('Registro finalizado. Datos limpios o redirección aquí.');
      });
    }
  });
};
</script>

<template>
  <div class="w-full min-h-screen bg-gray-100 flex flex-col pb-12">
    
    <AppHeader />
    
    <div class="container mx-auto max-w-5xl bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-600 mt-6">
      
      <div class="border-b pb-4 mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Registro: Alas Delta</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div>
          <label class="block text-gray-700 font-bold mb-2">1. Número de turistas</label>
          <input v-model="form.numeroTuristas" type="number" class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600"/>
        </div>
        <div>
          <label class="block text-gray-700 font-bold mb-2">2. Edad Mínima</label>
          <input v-model="form.edadMinima" type="number" class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600"/>
        </div>
        <div>
          <label class="block text-gray-700 font-bold mb-2">3. Peso y Altura</label>
          <input v-model="form.pesoAltura" type="text" placeholder="Ej: Max 90kg / Min 1.50m" class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600"/>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div class="bg-gray-50 p-6 rounded border">
          <h2 class="text-xl font-bold text-blue-800 mb-4 border-b pb-2">Turista</h2>
          <div class="flex flex-col gap-3">
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.turista.casco" class="w-5 h-5 text-blue-600 rounded"><span>1. Casco</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.turista.paracaidas" class="w-5 h-5 text-blue-600 rounded"><span>2. Paracaídas</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.turista.mosqueton" class="w-5 h-5 text-blue-600 rounded"><span>3. Mosquetón</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.turista.vestimenta" class="w-5 h-5 text-blue-600 rounded"><span>4. Vestimenta</span></label>
          </div>
        </div>

        <div class="bg-gray-50 p-6 rounded border">
          <h2 class="text-xl font-bold text-blue-800 mb-4 border-b pb-2">Piloto Guía</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.piloto.casco" class="w-5 h-5 text-blue-600 rounded"><span>1. Casco</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.piloto.paracaidas" class="w-5 h-5 text-blue-600 rounded"><span>2. Paracaídas</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.piloto.mosqueton" class="w-5 h-5 text-blue-600 rounded"><span>3. Mosquetón</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.piloto.botiquin" class="w-5 h-5 text-blue-600 rounded"><span>4. Botiquín</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.piloto.comunicacion" class="w-5 h-5 text-blue-600 rounded"><span>5. Sist. de Comunicación</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.piloto.vestimenta" class="w-5 h-5 text-blue-600 rounded"><span>6. Vestimenta</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.piloto.guante" class="w-5 h-5 text-blue-600 rounded"><span>7. Guante</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.piloto.anemometro" class="w-5 h-5 text-blue-600 rounded"><span>8. Anemómetro</span></label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.piloto.gps" class="w-5 h-5 text-blue-600 rounded"><span>9. GPS</span></label>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 p-6 rounded border mb-10">
        <h2 class="text-xl font-bold text-blue-800 mb-4 border-b pb-2">Equipo Complementario</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.mangaViento" class="w-5 h-5 text-blue-600 rounded"><span>1. Manga de viento</span></label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.biplaza" class="w-5 h-5 text-blue-600 rounded"><span>2. Biplaza</span></label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.transporte" class="w-5 h-5 text-blue-600 rounded"><span>3. Transporte</span></label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.persona" class="w-5 h-5 text-blue-600 rounded"><span>4. Persona</span></label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.brujula" class="w-5 h-5 text-blue-600 rounded"><span>5. Brújula</span></label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.altivario" class="w-5 h-5 text-blue-600 rounded"><span>6. Altivario</span></label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.bengala" class="w-5 h-5 text-blue-600 rounded"><span>7. Bengala</span></label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.agua" class="w-5 h-5 text-blue-600 rounded"><span>8. Agua</span></label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.manta" class="w-5 h-5 text-blue-600 rounded"><span>9. Manta</span></label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.extintores" class="w-5 h-5 text-blue-600 rounded"><span>10. Extintores</span></label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="checkbox" v-model="form.equipo.botiquin" class="w-5 h-5 text-blue-600 rounded"><span>11. Botiquín</span></label>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-200">
          <label class="flex items-center gap-2 cursor-pointer font-bold text-gray-700 hover:text-blue-600 mb-2"><input type="checkbox" v-model="form.equipo.otros" class="w-5 h-5 text-blue-600 rounded"><span>12. Otros</span></label>
          <div v-if="form.equipo.otros" class="mt-2 pl-7 transition-all duration-300">
            <input v-model="form.otrosDescripcion" type="text" placeholder="Especifique otros equipos complementarios..." class="w-full md:w-2/3 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600"/>
          </div>
        </div>
      </div>

      <div class="border-t pt-6 flex justify-end">
        <button @click="guardarFormulario" class="bg-blue-900 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded shadow-md transition transform hover:scale-105">
          💾 Guardar Registro y Generar PDF
        </button>
      </div>

    </div>
  </div>
</template>