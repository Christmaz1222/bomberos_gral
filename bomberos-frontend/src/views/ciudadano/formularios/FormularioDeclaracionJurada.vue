<template>
  <form @submit.prevent="enviar" class="space-y-6">
    <!-- FASE 3c — FORM-DNB-006 (legacy DECLA-JUR: Formulario Único de Declaración Jurada) -->
    <!-- Sección 1: Datos Generales del Establecimiento (formbns06: nombrerz, nit, ciudad, direccion) -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-dnb-primary">business</span>
        Datos Generales del Establecimiento
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Nombre o Razón Social <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre_razon_social"
            type="text"
            maxlength="200"
            required
            placeholder="Ej: Complejo Comercial El Sol S.R.L."
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            NIT <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nit"
            type="text"
            maxlength="20"
            required
            placeholder="Ej: 1029445016"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Ciudad <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.ciudad"
            type="text"
            maxlength="50"
            required
            placeholder="Ej: Santa Cruz de la Sierra"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Dirección Exacta de la Oficina / Planta <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.direccion_oficina"
            type="text"
            maxlength="200"
            required
            placeholder="Ej: Av. Cristo Redentor N° 1234, entre 3er y 4to anillo"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Sección 2: Responsable Legal (formbns06: responsablelegal, ciresponsable, telefono, mail) -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-dnb-primary">person</span>
        Datos del Responsable Legal
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Nombre del Responsable Legal <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre_responsable_legal"
            type="text"
            maxlength="200"
            required
            placeholder="Ej: Lic. Roberto Gómez Bolaños"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            N° de CI del Responsable <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.n_ci"
            type="text"
            maxlength="20"
            required
            placeholder="Ej: 4321098"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Teléfono Oficina / Celular <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.telefono"
            type="tel"
            maxlength="20"
            required
            placeholder="Ej: 33456789"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Correo Electrónico <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.correo"
            type="email"
            maxlength="100"
            required
            placeholder="Ej: legal@empresa.com"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Sección 3: Ubicación (formbns06: departamento, provincia, municipio) -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-dnb-primary">location_on</span>
        Ubicación Territorial
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Departamento <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.departamento"
            required
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          >
            <option value="">Seleccione...</option>
            <option v-for="d in DEPARTAMENTOS" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Provincia <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.provincia"
            type="text"
            maxlength="100"
            required
            placeholder="Ej: Andrés Ibáñez"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Municipio <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.municipio"
            type="text"
            maxlength="100"
            required
            placeholder="Ej: Santa Cruz de la Sierra"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Sección 4: Plan de Emergencia y Criterios Técnicos (formbns06: nombre_persona, nivel, tipo) -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-dnb-primary">emergency</span>
        Plan de Emergencia y Criterios SIPPCI
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Personal / Profesional que elaboró el Plan de Emergencia <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre_personal_elaboro_plan"
            type="text"
            maxlength="200"
            required
            placeholder="Ej: Ing. Jorge Luis Valdivia - Reg. SIPPCI-0452"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Nivel de Riesgo Determinado <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.nivel_riesgo"
            required
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          >
            <option value="">Seleccione el nivel...</option>
            <option v-for="n in NIVELES_RIESGO" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Tipo de Infraestructura (Título 4to SIPPCI) <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.tipo_infraestructura"
            type="text"
            maxlength="100"
            required
            placeholder="Ej: Comercial / Edificación Pública / Industrial"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Sección 5: Depósito Bancario (formbns06: num_operacion, fecha_deposito, monto_deposito, docs) -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-dnb-primary">payments</span>
        Depósito Bancario
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            N° de Operación Bancaria <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.n_operacion"
            type="text"
            maxlength="50"
            required
            placeholder="Ej: 98765432"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Fecha del Depósito <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.fecha_deposito"
            type="date"
            required
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Monto Depositado (Bs) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.monto_deposito"
            type="number"
            step="0.01"
            min="1"
            required
            placeholder="Ej: 500.00"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div class="md:col-span-3">
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Comprobante / Boleta de Depósito <span class="text-red-500">*</span>
          </label>
          <input
            ref="fileInput"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            required
            @change="onFileChange"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-dnb-primary file:text-white hover:file:bg-red-700 transition-all"
          />
          <p class="text-[10px] text-gray-400 mt-1">JPG, PNG o PDF, máx 1 MB (legacy: comprobante / fotografía de la boleta)</p>
          <p v-if="fileError" class="text-[10px] text-red-500 mt-1">{{ fileError }}</p>
        </div>
      </div>
    </div>

    <!-- NOTA: FORM-DNB-006 NO tiene observaciones por diseño legacy -->

    <!-- Errores de validación -->
    <div v-if="errores.length && intentoEnvio" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex gap-2">
        <span class="material-symbols-outlined text-red-600 text-[20px]">error</span>
        <div class="flex-1">
          <p class="text-xs font-bold text-red-800 mb-1">Corrige los siguientes errores:</p>
          <ul class="text-xs text-red-700 list-disc list-inside space-y-0.5">
            <li v-for="(err, i) in errores" :key="i">{{ err }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div class="flex flex-col sm:flex-row sm:justify-end gap-3">
      <RouterLink
        to="/mis-solicitudes/nueva"
        class="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center"
      >
        Cancelar
      </RouterLink>
      <button
        type="submit"
        :disabled="enviando"
        class="px-6 py-2.5 rounded-lg bg-dnb-primary text-white text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="enviando" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
        <span v-else class="material-symbols-outlined text-[18px]">send</span>
        {{ enviando ? 'Enviando...' : 'Crear Declaración Jurada' }}
      </button>
    </div>
  </form>
</template>

<script setup>
// FASE 3c: Formulario Único de Declaración Jurada (FORM-DNB-006 / legacy DECLA-JUR)
// Catálogos hardcoded en el frontend — TODO FASE 5: API catalogos
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../../config/api'
import { useToast } from '../../../composables/useToast'

const props = defineProps({
  submoduloId: { type: Number, required: true },
  submoduloNombre: { type: String, required: true },
  moduloNombre: { type: String, required: true },
})

const router = useRouter()
const toast = useToast()

const enviando = ref(false)
const intentoEnvio = ref(false)
const fileError = ref('')

/** Catálogo oficial de departamentos (legacy: tabla departamentos/sedes) */
const DEPARTAMENTOS = [
  'La Paz',
  'Santa Cruz',
  'Cochabamba',
  'Oruro',
  'Potosí',
  'Chuquisaca',
  'Tarija',
  'Beni',
  'Pando',
]

/** Catálogo oficial de niveles de riesgo (legacy: tabla nriesgo) */
const NIVELES_RIESGO = [
  'Bajo',
  'Mediano',
  'Alto',
  'Extremo',
]

/** Campos reales del legacy formbnd06s (normalizados a snake_case) */
const form = ref({
  nombre_razon_social: '',
  nit: '',
  ciudad: '',
  direccion_oficina: '',
  nombre_responsable_legal: '',
  n_ci: '',
  telefono: '',
  correo: '',
  departamento: '',
  provincia: '',
  municipio: '',
  nombre_personal_elaboro_plan: '',
  nivel_riesgo: '',
  tipo_infraestructura: '',
  n_operacion: '',
  fecha_deposito: '',
  monto_deposito: null,
})

const archivo = ref(null)

const errores = computed(() => {
  const errs = []
  const camposObligatorios = [
    ['nombre_razon_social', 'Nombre o Razón Social'],
    ['nit', 'NIT'],
    ['ciudad', 'Ciudad'],
    ['direccion_oficina', 'Dirección Exacta'],
    ['nombre_responsable_legal', 'Nombre del Responsable Legal'],
    ['n_ci', 'N° de CI del Responsable'],
    ['telefono', 'Teléfono'],
    ['correo', 'Correo Electrónico'],
    ['departamento', 'Departamento'],
    ['provincia', 'Provincia'],
    ['municipio', 'Municipio'],
    ['nombre_personal_elaboro_plan', 'Personal que elaboró el Plan'],
    ['nivel_riesgo', 'Nivel de Riesgo'],
    ['tipo_infraestructura', 'Tipo de Infraestructura'],
    ['n_operacion', 'N° de Operación Bancaria'],
    ['fecha_deposito', 'Fecha del Depósito'],
  ]

  camposObligatorios.forEach(([key, label]) => {
    if (!form.value[key] || !String(form.value[key]).trim()) errs.push(`${label} es obligatorio`)
  })

  if (!form.value.monto_deposito || form.value.monto_deposito <= 0) {
    errs.push('Monto depositado debe ser mayor a 0 Bs')
  }

  if (form.value.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.correo.trim())) {
    errs.push('Correo electrónico inválido')
  }

  if (!archivo.value) errs.push('Comprobante de depósito es obligatorio')

  return errs
})

function onFileChange(e) {
  fileError.value = ''
  const file = e.target.files[0]
  if (!file) {
    archivo.value = null
    return
  }

  const permitidos = ['image/jpeg', 'image/png', 'application/pdf']
  if (!permitidos.includes(file.type)) {
    fileError.value = 'Tipo de archivo no permitido (JPG, PNG o PDF)'
    archivo.value = null
    return
  }

  if (file.size > 1024 * 1024) {
    fileError.value = 'El archivo excede 1 MB'
    archivo.value = null
    return
  }

  archivo.value = file
}

async function enviar() {
  intentoEnvio.value = true
  if (errores.value.length > 0) {
    toast.error('Corrige los errores antes de continuar')
    return
  }

  enviando.value = true
  try {
    const payload = {
      submodulo_id: props.submoduloId,
      tipo_persona: 'JURIDICA',
      empresa_id: undefined,
      datos_especificos: {
        // Sección 1: Generales
        nombre_razon_social: form.value.nombre_razon_social.trim(),
        nit: form.value.nit.trim(),
        ciudad: form.value.ciudad.trim(),
        direccion_oficina: form.value.direccion_oficina.trim(),
        // Sección 2: Responsable Legal
        nombre_responsable_legal: form.value.nombre_responsable_legal.trim(),
        n_ci: form.value.n_ci.trim(),
        telefono: form.value.telefono.trim(),
        correo: form.value.correo.trim(),
        // Sección 3: Ubicación
        departamento: form.value.departamento,
        provincia: form.value.provincia.trim(),
        municipio: form.value.municipio.trim(),
        // Sección 4: Plan de Emergencia
        nombre_personal_elaboro_plan: form.value.nombre_personal_elaboro_plan.trim(),
        nivel_riesgo: form.value.nivel_riesgo,
        tipo_infraestructura: form.value.tipo_infraestructura.trim(),
        // Sección 5: Depósito
        n_operacion: form.value.n_operacion.trim(),
        fecha_deposito: form.value.fecha_deposito,
        monto_deposito: form.value.monto_deposito,
        // Metadata legacy: identifica formulario fuente (formbns06)
        tipo_formulario: 'DECLA-JUR',
        submodulo_nombre: props.submoduloNombre,
      },
      observacion: null, // Legacy formbns06 NO tiene observaciones
    }

    const { data } = await apiClient.post('/solicitudes', payload)
    const codigo = data.solicitud?.codigo || data.codigo

    // Subir comprobante de depósito
    if (archivo.value) {
      const formData = new FormData()
      formData.append('archivo', archivo.value)
      formData.append('tipo_documento', 'COMPROBANTE')
      await apiClient.post(`/solicitudes/${codigo}/documentos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    toast.success(`Declaración Jurada creada: ${codigo}`)
    router.push(`/mis-solicitudes/${codigo}`)
  } catch (e) {
    console.error('Error creando solicitud:', e)
    toast.error(e.response?.data?.message || 'No se pudo crear la solicitud')
  } finally {
    enviando.value = false
  }
}
</script>