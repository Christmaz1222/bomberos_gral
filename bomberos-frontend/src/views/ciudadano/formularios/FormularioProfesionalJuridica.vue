<template>
  <form @submit.prevent="enviar" class="space-y-6">
    <!-- FASE 3a — FORM-DNB-003 (legacy REGPROF-JUR) -->
    <!-- Sección 1: Datos de la Entidad (formbns03: nombrerz, nit, oficina, legal) -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-dnb-primary">apartment</span>
        Datos del Solicitante (Persona Jurídica)
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Nombre / Razón Social <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre_razon_social"
            type="text"
            maxlength="200"
            required
            placeholder="Ej: Empresa Consultora S.R.L."
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
            Entidad / Institución <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.entidad_institucion"
            type="text"
            maxlength="200"
            required
            placeholder="Ej: Oficina Técnica La Paz"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Nombre del Responsable Legal <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.responsable_legal"
            type="text"
            maxlength="200"
            required
            placeholder="Ej: José Luis Mamani Choque"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Cédula de Identidad <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.ci"
            type="text"
            maxlength="20"
            required
            placeholder="Ej: 6745321"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Expedido <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.expedido"
            required
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          >
            <option value="">Seleccione...</option>
            <option v-for="d in DEPARTAMENTOS" :key="d" :value="d">{{ d }}</option>
          </select>
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
            placeholder="Ej: empresa@correo.com"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Teléfono <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.telefono"
            type="tel"
            maxlength="20"
            required
            placeholder="Ej: 22012345"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Sección 2: Ubicación (formbns03: ciudad, departamento, provincia, municipio) -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-dnb-primary">location_on</span>
        Ubicación
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Ciudad <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.ciudad"
            type="text"
            maxlength="100"
            required
            placeholder="Ej: La Paz"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

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
            placeholder="Ej: Murillo"
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
            placeholder="Ej: La Paz"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Sección 3: Datos del Profesional (formbns03: ncprofesional, ciprofesional, carrera, educacion) -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-dnb-primary">badge</span>
        Datos del Profesional Acreditado
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Nombre Completo del Profesional <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre_completo_profesional"
            type="text"
            maxlength="200"
            required
            placeholder="Ej: Ing. María Fernanda Rojas"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            N° de CI del Profesional <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.n_ci_profesional"
            type="text"
            maxlength="20"
            required
            placeholder="Ej: 3456789"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Carrera / Especialidad <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.carrera"
            type="text"
            maxlength="200"
            required
            placeholder="Ej: Ingeniería Industrial"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Nivel de Educación <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.nivel_educacion"
            required
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all"
          >
            <option value="">Seleccione...</option>
            <option v-for="n in NIVELES_EDUCACION" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Sección 4: Depósito Bancario (formbns03: deposito, fdeposito, docs) -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-dnb-primary">payments</span>
        Depósito Bancario
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            N° de Depósito <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.n_deposito"
            type="text"
            maxlength="50"
            required
            placeholder="Ej: 458621"
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

        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Comprobante de Depósito <span class="text-red-500">*</span>
          </label>
          <input
            ref="fileInput"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            required
            @change="onFileChange"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-dnb-primary file:text-white hover:file:bg-red-700 transition-all"
          />
          <p class="text-[10px] text-gray-400 mt-1">JPG, PNG o PDF, máx 1 MB (legacy: imagen del comprobante)</p>
          <p v-if="fileError" class="text-[10px] text-red-500 mt-1">{{ fileError }}</p>
        </div>
      </div>
    </div>

    <!-- Sección 5: Observaciones (formbns03: observaciones) -->
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-dnb-primary">notes</span>
        Observaciones (opcional)
      </h3>

      <textarea
        v-model="form.observaciones"
        rows="3"
        maxlength="500"
        class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-dnb-primary/30 transition-all resize-none"
      ></textarea>
      <p class="text-[10px] text-gray-400 mt-1 text-right">{{ form.observaciones.length }}/500</p>
    </div>

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
        {{ enviando ? 'Enviando...' : 'Crear Solicitud' }}
      </button>
    </div>
  </form>
</template>

<script setup>
// FASE 3a: Formulario Profesional Jurídica (FORM-DNB-003 / legacy REGPROF-JUR)
// Catálogos hardcoded en el frontend (no hay tabla Catalogos en el backend) — TODO FASE 5: API catalogos
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

/** Catálogo oficial de niveles de educación (legacy: select neducacion) */
const NIVELES_EDUCACION = [
  'Técnico Medio',
  'Técnico Superior',
  'Licenciatura',
  'Maestría',
  'Doctorado',
  'Otro',
]

/** Campos reales del legacy formbnd03s (normalizados a snake_case) */
const form = ref({
  nombre_razon_social: '',
  nit: '',
  entidad_institucion: '',
  responsable_legal: '',
  ci: '',
  expedido: '',
  correo: '',
  telefono: '',
  ciudad: '',
  departamento: '',
  provincia: '',
  municipio: '',
  nombre_completo_profesional: '',
  n_ci_profesional: '',
  carrera: '',
  nivel_educacion: '',
  n_deposito: '',
  fecha_deposito: '',
  observaciones: '',
})

const archivo = ref(null)

const errores = computed(() => {
  const errs = []
  const camposObligatorios = [
    ['nombre_razon_social', 'Nombre/Razón Social'],
    ['nit', 'NIT'],
    ['entidad_institucion', 'Entidad/Institución'],
    ['responsable_legal', 'Responsable Legal'],
    ['ci', 'Cédula de Identidad'],
    ['expedido', 'Expedido'],
    ['correo', 'Correo Electrónico'],
    ['telefono', 'Teléfono'],
    ['ciudad', 'Ciudad'],
    ['departamento', 'Departamento'],
    ['provincia', 'Provincia'],
    ['municipio', 'Municipio'],
    ['nombre_completo_profesional', 'Nombre Completo del Profesional'],
    ['n_ci_profesional', 'N° CI del Profesional'],
    ['carrera', 'Carrera/Especialidad'],
    ['nivel_educacion', 'Nivel de Educación'],
    ['n_deposito', 'N° de Depósito'],
    ['fecha_deposito', 'Fecha del Depósito'],
  ]

  camposObligatorios.forEach(([key, label]) => {
    if (!form.value[key] || !String(form.value[key]).trim()) errs.push(`${label} es obligatorio`)
  })

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
    // FASE 3a-fix: persona jurídica real (JURIDICA). empresa_id es opcional
    // en el backend, por lo que no se envía (se puede vincular después).
    const payload = {
      submodulo_id: props.submoduloId,
      tipo_persona: 'JURIDICA',
      empresa_id: undefined,
      datos_especificos: {
        // Sección 1: Datos del Solicitante (Jurídica)
        nombre_razon_social: form.value.nombre_razon_social.trim(),
        nit: form.value.nit.trim(),
        entidad_institucion: form.value.entidad_institucion.trim(),
        responsable_legal: form.value.responsable_legal.trim(),
        ci: form.value.ci.trim(),
        expedido: form.value.expedido,
        correo: form.value.correo.trim(),
        telefono: form.value.telefono.trim(),
        // Sección 2: Ubicación
        ciudad: form.value.ciudad.trim(),
        departamento: form.value.departamento,
        provincia: form.value.provincia.trim(),
        municipio: form.value.municipio.trim(),
        // Sección 3: Datos del Profesional
        nombre_completo_profesional: form.value.nombre_completo_profesional.trim(),
        n_ci_profesional: form.value.n_ci_profesional.trim(),
        carrera: form.value.carrera.trim(),
        nivel_educacion: form.value.nivel_educacion,
        // Sección 4: Depósito
        n_deposito: form.value.n_deposito.trim(),
        fecha_deposito: form.value.fecha_deposito,
        // Sección 5: Observaciones (opcional)
        observaciones: form.value.observaciones.trim(),
        // Metadata legacy: identifica el formulario fuente (formbns03)
        tipo_formulario: 'REGPROF-JUR',
        submodulo_nombre: props.submoduloNombre,
      },
      observacion: form.value.observaciones?.trim() || null,
    }

    const { data } = await apiClient.post('/solicitudes', payload)
    const codigo = data.solicitud?.codigo || data.codigo

    // Subir comprobante de depósito como documento (POST /solicitudes/:codigo/documentos)
    if (archivo.value) {
      const formData = new FormData()
      formData.append('archivo', archivo.value)
      formData.append('tipo_documento', 'COMPROBANTE')
      await apiClient.post(`/solicitudes/${codigo}/documentos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    toast.success(`Solicitud creada: ${codigo}`)
    router.push(`/mis-solicitudes/${codigo}`)
  } catch (e) {
    console.error('Error creando solicitud:', e)
    toast.error(e.response?.data?.message || 'No se pudo crear la solicitud')
  } finally {
    enviando.value = false
  }
}
</script>