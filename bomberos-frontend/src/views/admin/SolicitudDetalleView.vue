<template>
  <div class="flex flex-col gap-5">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm">
      <RouterLink to="/admin/solicitudes" class="text-gray-500 hover:text-dnb-primary transition-colors">
        Solicitudes
      </RouterLink>
      <span class="material-symbols-outlined text-[16px] text-gray-300">chevron_right</span>
      <span class="text-gray-900 font-semibold font-mono">{{ codigo }}</span>
    </nav>

    <!-- Skeleton de carga -->
    <div v-if="cargando" class="space-y-4 animate-pulse">
      <div class="h-24 bg-gray-100 rounded-xl"></div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="h-64 bg-gray-100 rounded-xl"></div>
        <div class="h-64 bg-gray-100 rounded-xl"></div>
        <div class="h-64 bg-gray-100 rounded-xl"></div>
      </div>
    </div>

    <!-- Error 404 / not found -->
    <div v-else-if="!solicitud" class="bg-white rounded-xl shadow-sm p-12 text-center">
      <span class="material-symbols-outlined text-6xl text-gray-300">search_off</span>
      <h2 class="mt-3 text-lg font-bold text-gray-700">Solicitud no encontrada</h2>
      <p class="mt-1 text-sm text-gray-500">
        La solicitud <span class="font-mono font-semibold">{{ codigo }}</span> no existe o fue eliminada.
      </p>
      <RouterLink
        to="/admin/solicitudes"
        class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-dnb-dark text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver a la lista
      </RouterLink>
    </div>

    <!-- Contenido real -->
    <template v-else>
      <!-- Header con estado y datos principales -->
      <header class="bg-white rounded-xl shadow-sm p-5">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="px-2 py-0.5 rounded bg-dnb-primary text-white text-[10px] font-bold uppercase tracking-wider">
                {{ solicitud.submodulo.modulo.nombre }}
              </span>
              <EstadoBadge :estado="solicitud.estado" />
              <button
                @click="mostrarModalCambio = true"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dnb-primary text-white text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                <span class="material-symbols-outlined text-[16px]">swap_horiz</span>
                Cambiar Estado
              </button>
              <button
                @click="mostrarModalInspector = true"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                <span class="material-symbols-outlined text-[16px]">person_add</span>
                Asignar Inspector
              </button>
              <button
                @click="descargarComprobante"
                :disabled="descargandoComprobante"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <span
                  class="material-symbols-outlined text-[16px]"
                  :class="{ 'animate-spin': descargandoComprobante }"
                >
                  {{ descargandoComprobante ? 'progress_activity' : 'receipt_long' }}
                </span>
                Comprobante
              </button>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 font-mono">{{ solicitud.codigo }}</h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ solicitud.submodulo.nombre }}
            </p>
          </div>

          <div class="flex flex-col items-end text-right gap-1">
            <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              Fecha de solicitud
            </span>
            <span class="text-sm font-semibold text-gray-800">
              {{ formatearFechaHora(solicitud.fecha_solicitud) }}
            </span>
            <span v-if="solicitud.fecha_aprobacion" class="text-[10px] text-green-600 font-semibold mt-1">
              Aprobada: {{ formatearFechaHora(solicitud.fecha_aprobacion) }}
            </span>
          </div>
        </div>

        <!-- Observación -->
        <div v-if="solicitud.observacion" class="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div class="flex gap-2">
            <span class="material-symbols-outlined text-yellow-600 text-[18px]">info</span>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-yellow-700">Observación</p>
              <p class="text-sm text-gray-700 mt-0.5">{{ solicitud.observacion }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Checklist de requisitos del trámite -->
      <RequisitosChecklist :codigo="codigo" @updated="cargar" />

      <!-- Grid principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Columna izquierda: Solicitante + Historial -->
        <div class="lg:col-span-2 flex flex-col gap-4">
          <!-- Solicitante / Empresa -->
          <section class="bg-white rounded-xl shadow-sm p-5">
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-dnb-primary">person</span>
              {{ solicitud.tipo_persona === 'JURIDICA' ? 'Empresa / Representante' : 'Solicitante' }}
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="solicitud.tipo_persona === 'JURIDICA' && solicitud.empresa">
                <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Razón Social</p>
                <p class="text-sm font-semibold text-gray-800 mt-0.5">{{ solicitud.empresa.razon_social }}</p>
              </div>
              <div v-if="solicitud.tipo_persona === 'JURIDICA' && solicitud.empresa">
                <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">NIT</p>
                <p class="text-sm font-semibold text-gray-800 mt-0.5 font-mono">{{ solicitud.empresa.nit }}</p>
              </div>
              <div v-if="solicitud.usuario">
                <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Nombre</p>
                <p class="text-sm font-semibold text-gray-800 mt-0.5">{{ solicitud.usuario.nombre_completo }}</p>
              </div>
              <div v-if="solicitud.usuario">
                <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">CI</p>
                <p class="text-sm font-semibold text-gray-800 mt-0.5 font-mono">{{ solicitud.usuario.ci }}</p>
              </div>
              <div v-if="solicitud.usuario">
                <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Email</p>
                <p class="text-sm font-semibold text-gray-800 mt-0.5 break-all">{{ solicitud.usuario.email }}</p>
              </div>
              <div v-if="solicitud.usuario">
                <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Teléfono</p>
                <p class="text-sm font-semibold text-gray-800 mt-0.5 font-mono">{{ solicitud.usuario.telefono || '—' }}</p>
              </div>
            </div>
          </section>

          <!-- Timeline de historial -->
          <section class="bg-white rounded-xl shadow-sm p-5">
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-dnb-primary">timeline</span>
              Historial de Transiciones
            </h2>

            <div v-if="solicitud.historial && solicitud.historial.length" class="relative">
              <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>

              <div class="flex flex-col gap-4">
                <div v-for="(h, i) in solicitud.historial" :key="h.id" class="relative pl-10">
                  <div
                    class="absolute left-0 top-1 w-7 h-7 rounded-full flex items-center justify-center z-10"
                    :class="i === solicitud.historial.length - 1 ? 'bg-dnb-primary text-white' : 'bg-gray-100 text-gray-500'"
                  >
                    <span class="material-symbols-outlined text-[14px]">
                      {{ i === 0 ? 'flag' : 'check' }}
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span v-if="h.estado_anterior" class="text-xs text-gray-400 font-mono">
                        {{ formatearEstado(h.estado_anterior) }}
                      </span>
                      <span v-if="h.estado_anterior" class="material-symbols-outlined text-[14px] text-gray-300">
                        arrow_forward
                      </span>
                      <EstadoBadge :estado="h.estado_nuevo" />
                    </div>
                    <p v-if="h.observacion" class="text-xs text-gray-600 mt-1">{{ h.observacion }}</p>
                    <p class="text-[10px] text-gray-400 mt-1">{{ formatearFechaHora(h.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <p v-else class="text-sm text-gray-500 text-center py-4">
              No hay transiciones registradas
            </p>
          </section>

          <!-- Datos de dominio -->
          <section
            v-if="datosDominio"
            class="bg-white rounded-xl shadow-sm p-5"
          >
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-dnb-primary">description</span>
              Datos del Formulario
            </h2>

            <pre class="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto text-gray-700 font-mono">{{ JSON.stringify(datosDominio.datos_especificos, null, 2) }}</pre>
          </section>
        </div>

        <!-- Columna derecha: Documentos + Pago + Certificado -->
        <div class="flex flex-col gap-4">
          <!-- Documentos -->
          <section class="bg-white rounded-xl shadow-sm p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-dnb-primary">folder</span>
                Documentos
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                {{ solicitud.documentos?.length || 0 }}
              </span>
            </div>

            <div v-if="solicitud.documentos && solicitud.documentos.length" class="flex flex-col gap-2">
              <div
                v-for="doc in solicitud.documentos"
                :key="doc.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-outlined text-red-600 text-[22px]">picture_as_pdf</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-800 truncate">{{ doc.nombre_original }}</p>
                  <p class="text-[10px] text-gray-500">
                    {{ doc.tipo_documento }} · {{ formatearFecha(doc.fecha_subida) }}
                  </p>
                </div>
                <button
                  @click="descargarDocumento(doc)"
                  :disabled="descargando[doc.id]"
                  class="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50"
                  title="Descargar documento"
                >
                  <span
                    class="material-symbols-outlined text-[18px]"
                    :class="{ 'animate-spin': descargando[doc.id] }"
                  >
                    {{ descargando[doc.id] ? 'progress_activity' : 'download' }}
                  </span>
                </button>
              </div>
            </div>

            <p v-else class="text-xs text-gray-500 text-center py-4">
              Sin documentos cargados
            </p>
          </section>

          <!-- Pago -->
          <section class="bg-white rounded-xl shadow-sm p-5">
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-dnb-primary">payments</span>
              Pago
            </h2>

            <div v-if="solicitud.pagos && solicitud.pagos.length">
              <div v-for="pago in solicitud.pagos" :key="pago.id" class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Estado</span>
                  <span
                    class="text-xs font-bold px-2 py-0.5 rounded-full"
                    :class="pago.estado === 'PAGADO' || pago.estado === 'CONFIRMADO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
                  >
                    {{ pago.estado }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Monto UFV</span>
                  <span class="text-sm font-bold text-gray-900">{{ pago.monto_ufv }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Monto Bs</span>
                  <span class="text-sm font-bold text-gray-900">{{ pago.monto_bs }} Bs</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Orden</span>
                  <span class="text-[10px] font-mono text-gray-600">{{ pago.codigo_orden }}</span>
                </div>
              </div>
            </div>

            <p v-else class="text-xs text-gray-500 text-center py-4">
              No hay pagos registrados
            </p>
          </section>

          <!-- Certificado -->
          <section
            v-if="solicitud.certificados && solicitud.certificados.length"
            class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-sm p-5 border border-emerald-200"
          >
            <h2 class="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
              Certificado Emitido
            </h2>

            <div v-for="cert in solicitud.certificados" :key="cert.id" class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">N° Registro</span>
                <span class="text-xs font-bold text-emerald-900 font-mono">{{ cert.numero_registro }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Estado</span>
                <span class="text-xs font-bold text-emerald-900">{{ cert.estado }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Emisión</span>
                <span class="text-xs text-emerald-900">{{ formatearFecha(cert.fecha_emision) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Vence</span>
                <span class="text-xs text-emerald-900">{{ formatearFecha(cert.fecha_vencimiento) }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Botón volver -->
      <div class="flex justify-start">
        <RouterLink
          to="/admin/solicitudes"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver a la lista
        </RouterLink>
      </div>
    </template>

    <CambiarEstadoModal
      :visible="mostrarModalCambio"
      :codigo="codigo"
      :estado-actual="solicitud?.estado || ''"
      @close="mostrarModalCambio = false"
      @cambio="onCambioEstado"
    />

    <AsignarInspectorModal
      :visible="mostrarModalInspector"
      :codigo="codigo"
      @close="mostrarModalInspector = false"
      @asignado="onInspectorAsignado"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import adminService from '../../services/admin.service'
import { useToast } from '../../composables/useToast'
import EstadoBadge from '../../components/admin/EstadoBadge.vue'
import CambiarEstadoModal from '../../components/admin/CambiarEstadoModal.vue'
import AsignarInspectorModal from '../../components/admin/AsignarInspectorModal.vue'
import RequisitosChecklist from '../../components/admin/RequisitosChecklist.vue'

const route = useRoute()
const toast = useToast()

const solicitud = ref(null)
const cargando = ref(true)
const mostrarModalCambio = ref(false)
const mostrarModalInspector = ref(false)
const descargando = ref({})
const descargandoComprobante = ref(false)

async function descargarComprobante() {
  descargandoComprobante.value = true
  try {
    const response = await adminService.descargarComprobante(codigo.value)

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comprobante-${codigo.value}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('Comprobante descargado')
  } catch (e) {
    console.error('Error descargando comprobante:', e)
    toast.error('No se pudo descargar el comprobante')
  } finally {
    descargandoComprobante.value = false
  }
}

const codigo = computed(() => route.params.codigo)

const datosDominio = computed(() => {
  if (!solicitud.value) return null
  return (
    solicitud.value.sippci_datos ||
    solicitud.value.reglamentacion_datos ||
    solicitud.value.turismo_datos ||
    solicitud.value.capacitacion_datos ||
    null
  )
})

async function cargar() {
  cargando.value = true
  try {
    solicitud.value = await adminService.obtenerSolicitud(codigo.value)
  } catch (e) {
    console.error('Error cargando solicitud:', e)
    solicitud.value = null
    if (e.response?.status !== 404) {
      toast.error('No se pudo cargar la solicitud')
    }
  } finally {
    cargando.value = false
  }
}

function formatearEstado(estado) {
  const map = {
    BORRADOR: 'Borrador',
    PENDIENTE_PAGO: 'Pendiente Pago',
    PAGO_CONFIRMADO: 'Pago OK',
    EN_VERIFICACION: 'En Revisión',
    OBSERVADO: 'Observado',
    APROBADO: 'Aprobado',
    INSPECCION: 'Inspección',
    CERTIFICADO_EMITIDO: 'Certificado',
    ANULADO: 'Anulado',
  }
  return map[estado] || estado
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatearFechaHora(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  cargar()
})

function onCambioEstado() {
  cargar()
}

function onInspectorAsignado() {
  cargar()
}

async function descargarDocumento(doc) {
  descargando.value[doc.id] = true
  try {
    const response = await adminService.descargarDocumento(codigo.value, doc.id)
    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = doc.nombre_original
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success('Documento descargado')
  } catch (e) {
    console.error('Error descargando:', e)
    if (e.response?.status === 404) {
      toast.error('Archivo no encontrado en el servidor')
    } else {
      toast.error('No se pudo descargar el documento')
    }
  } finally {
    descargando.value[doc.id] = false
  }
}

watch(codigo, () => {
  cargar()
})
</script>