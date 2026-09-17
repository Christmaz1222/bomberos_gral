<template>
  <div class="flex flex-col gap-5">
    <!-- Header -->
    <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded bg-dnb-primary text-white text-[10px] font-bold uppercase tracking-wider">
            Análisis
          </span>
          <span class="text-gray-500 text-xs">• Distribución Geográfica</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Mapa de Solicitudes</h1>
        <p class="text-sm text-gray-500 mt-1">
          Distribución geográfica de trámites por departamento
        </p>
      </div>

      <button
        @click="cargar"
        :disabled="cargando"
        class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': cargando }">
          refresh
        </span>
        Refrescar
      </button>
    </header>

    <!-- Stats rápidas -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total solicitudes</p>
        <p class="text-3xl font-bold text-gray-900 mt-1">{{ totales.total_solicitudes }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Departamentos</p>
        <p class="text-3xl font-bold text-blue-600 mt-1">{{ totales.total_departamentos }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Sin ubicación</p>
        <p class="text-3xl font-bold text-orange-600 mt-1">{{ totales.sin_ubicacion }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Top departamento</p>
        <p class="text-lg font-bold text-dnb-primary mt-1 truncate">
          {{ datos[0]?.departamento || '—' }}
        </p>
        <p class="text-xs text-gray-500">{{ datos[0]?.total || 0 }} solicitudes</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl shadow-sm p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Estado
          </label>
          <select
            v-model="filtros.estado"
            @change="cargar"
            class="w-full h-10 px-3 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-dnb-primary/30"
          >
            <option value="">Todos</option>
            <option value="BORRADOR">Borrador</option>
            <option value="EN_VERIFICACION">En Revisión</option>
            <option value="APROBADO">Aprobado</option>
            <option value="CERTIFICADO_EMITIDO">Certificado</option>
            <option value="OBSERVADO">Observado</option>
            <option value="ANULADO">Anulado</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Módulo
          </label>
          <select
            v-model="filtros.modulo"
            @change="cargar"
            class="w-full h-10 px-3 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-dnb-primary/30"
          >
            <option value="">Todos</option>
            <option value="SIPPCI">SIPPCI</option>
            <option value="REGLAMENTACION">Reglamentación</option>
            <option value="TURISMO">Turismo</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Desde
          </label>
          <input
            v-model="filtros.fechaDesde"
            @change="cargar"
            type="date"
            class="w-full h-10 px-3 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-dnb-primary/30"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Hasta
          </label>
          <input
            v-model="filtros.fechaHasta"
            @change="cargar"
            type="date"
            class="w-full h-10 px-3 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-dnb-primary/30"
          />
        </div>
      </div>
    </div>

    <!-- Mapa + Panel lateral -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Mapa -->
      <div class="lg:col-span-9">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="flex items-center justify-between p-3 border-b border-gray-100">
            <h2 class="text-sm font-bold text-gray-900">Distribución Geográfica</h2>
            <div class="flex items-center gap-2">
              <button
                @click="cambiarModo('markers')"
                class="px-3 py-1 rounded text-xs font-semibold transition-colors"
                :class="modo === 'markers' ? 'bg-dnb-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                Marcadores
              </button>
              <button
                @click="cambiarModo('circles')"
                class="px-3 py-1 rounded text-xs font-semibold transition-colors"
                :class="modo === 'circles' ? 'bg-dnb-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                Círculos
              </button>
            </div>
          </div>

          <div v-if="cargando" class="h-[600px] flex items-center justify-center bg-gray-50">
            <div class="flex flex-col items-center gap-3">
              <span class="material-symbols-outlined text-4xl text-gray-400 animate-spin">progress_activity</span>
              <p class="text-sm text-gray-500">Cargando mapa...</p>
            </div>
          </div>

          <div v-show="!cargando" ref="mapContainer" class="h-[600px] w-full"></div>
        </div>
      </div>

      <!-- Panel lateral -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-xl shadow-sm p-4 h-full">
          <h2 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-dnb-primary">list</span>
            Ranking Departamental
          </h2>

          <div v-if="cargando" class="space-y-2 animate-pulse">
            <div v-for="i in 5" :key="i" class="h-12 bg-gray-100 rounded-lg"></div>
          </div>

          <div v-else-if="datos.length" class="space-y-2 max-h-[550px] overflow-y-auto">
            <div
              v-for="(dep, index) in datos"
              :key="dep.departamento"
              @click="centrarEnDepartamento(dep.departamento)"
              class="p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md"
              :class="departamentoSeleccionado === dep.departamento ? 'border-dnb-primary bg-red-50' : 'border-gray-100 hover:border-gray-300'"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span
                    class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    :class="index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'"
                  >
                    {{ index + 1 }}
                  </span>
                  <span class="text-sm font-semibold text-gray-900">{{ dep.departamento }}</span>
                </div>
                <span class="text-lg font-bold text-dnb-primary">{{ dep.total }}</span>
              </div>

              <!-- Mini barra de progreso -->
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  class="bg-dnb-primary h-full rounded-full transition-all"
                  :style="{ width: `${(dep.total / datos[0].total) * 100}%` }"
                ></div>
              </div>

              <!-- Estados -->
              <div class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="(count, estado) in dep.porEstado"
                  :key="estado"
                  class="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                  :class="estadoBadge(estado)"
                >
                  {{ formatearEstado(estado) }}: {{ count }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="py-8 text-center">
            <span class="material-symbols-outlined text-4xl text-gray-300">map</span>
            <p class="text-xs text-gray-500 mt-2">Sin datos para mostrar</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import L from 'leaflet'
import adminService from '../../services/admin.service'
import { useToast } from '../../composables/useToast'

const toast = useToast()

// Coordenadas aproximadas de los departamentos de Bolivia
const COORDENADAS_DEPARTAMENTOS = {
  'La Paz': [-16.5, -68.15],
  'Santa Cruz': [-17.7833, -63.1833],
  'Cochabamba': [-17.3895, -66.1568],
  'Oruro': [-17.9833, -67.15],
  'Potosí': [-19.5836, -65.7531],
  'Chuquisaca': [-19.0333, -65.2627],
  'Tarija': [-21.5355, -64.7296],
  'Beni': [-14.8333, -64.9],
  'Pando': [-11.0333, -68.7667],
}

const mapContainer = ref(null)
const mapa = ref(null)
const capaMarcadores = ref(null)
const marcadores = ref([])

const cargando = ref(true)
const datos = ref([])
const totales = ref({
  total_solicitudes: 0,
  total_departamentos: 0,
  sin_ubicacion: 0,
})

const filtros = ref({
  estado: '',
  modulo: '',
  fechaDesde: '',
  fechaHasta: '',
})

const modo = ref('circles')
const departamentoSeleccionado = ref('')

async function cargar() {
  cargando.value = true
  try {
    const params = {}
    if (filtros.value.estado) params.estado = filtros.value.estado
    if (filtros.value.modulo) params.modulo = filtros.value.modulo
    if (filtros.value.fechaDesde) params.fechaDesde = filtros.value.fechaDesde
    if (filtros.value.fechaHasta) params.fechaHasta = filtros.value.fechaHasta

    const resp = await adminService.obtenerDatosMapa(params)
    datos.value = resp.datos
    totales.value = resp.totales

    await nextTick()
    renderizarMapa()
  } catch (e) {
    console.error('Error cargando mapa:', e)
    toast.error('No se pudieron cargar los datos del mapa')
  } finally {
    cargando.value = false
  }
}

function inicializarMapa() {
  if (!mapContainer.value || mapa.value) return

  // Centro en Bolivia
  mapa.value = L.map(mapContainer.value, {
    center: [-16.5, -64.5],
    zoom: 5,
    zoomControl: true,
  })

  // Tile layer OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(mapa.value)

  capaMarcadores.value = L.layerGroup().addTo(mapa.value)
}

function renderizarMapa() {
  if (!mapa.value) return

  // Limpiar capa
  capaMarcadores.value.clearLayers()
  marcadores.value = []

  // Máximo para escalar tamaños
  const maxTotal = Math.max(...datos.value.map((d) => d.total), 1)

  datos.value.forEach((dep) => {
    const coords = COORDENADAS_DEPARTAMENTOS[dep.departamento]

    if (!coords) {
      // Sin ubicación → no se muestra en el mapa
      return
    }

    if (modo.value === 'markers') {
      // Modo marcadores: círculos con número
      const size = 30 + (dep.total / maxTotal) * 50

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: #C41E3A;
            color: white;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: ${Math.max(11, size / 3.5)}px;
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            ${dep.total}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const marker = L.marker(coords, { icon })
      marker.bindPopup(crearPopup(dep))
      marker.on('click', () => {
        departamentoSeleccionado.value = dep.departamento
      })
      marker.addTo(capaMarcadores.value)
      marcadores.value.push(marker)
    } else {
      // Modo círculos: círculos de área proporcional
      const radius = 20000 + (dep.total / maxTotal) * 80000

      const circle = L.circle(coords, {
        radius,
        color: '#C41E3A',
        fillColor: '#C41E3A',
        fillOpacity: 0.4,
        weight: 2,
      })
      circle.bindPopup(crearPopup(dep))
      circle.on('click', () => {
        departamentoSeleccionado.value = dep.departamento
      })
      circle.addTo(capaMarcadores.value)
      marcadores.value.push(circle)
    }
  })
}

function crearPopup(dep) {
  const estadosHTML = Object.entries(dep.porEstado)
    .map(([estado, count]) => `<span style="display:inline-block;margin:2px;padding:2px 6px;background:#f3f4f6;border-radius:10px;font-size:10px;">${formatearEstado(estado)}: ${count}</span>`)
    .join('')

  const solicitudesHTML = dep.solicitudes
    .slice(0, 5)
    .map((s) => `<div style="padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><strong>${s.codigo}</strong> - ${s.submodulo}</div>`)
    .join('')

  const masHTML = dep.solicitudes.length > 5
    ? `<div style="padding:4px 0;font-size:10px;color:#666;">+${dep.solicitudes.length - 5} más...</div>`
    : ''

  return `
    <div style="min-width: 220px;">
      <h3 style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#1A3A5C;">${dep.departamento}</h3>
      <p style="margin:0 0 8px;font-size:24px;font-weight:bold;color:#C41E3A;">${dep.total}</p>
      <p style="margin:0 0 8px;font-size:10px;color:#666;">solicitudes</p>
      <div style="margin-bottom:8px;">${estadosHTML}</div>
      <div style="max-height:120px;overflow-y:auto;">${solicitudesHTML}${masHTML}</div>
    </div>
  `
}

function cambiarModo(nuevoModo) {
  modo.value = nuevoModo
  renderizarMapa()
}

function centrarEnDepartamento(departamento) {
  departamentoSeleccionado.value = departamento
  const coords = COORDENADAS_DEPARTAMENTOS[departamento]
  if (coords && mapa.value) {
    mapa.value.setView(coords, 9, { animate: true })
  }
}

function estadoBadge(estado) {
  const map = {
    BORRADOR: 'bg-gray-100 text-gray-700',
    PENDIENTE_PAGO: 'bg-orange-100 text-orange-700',
    PAGO_CONFIRMADO: 'bg-blue-100 text-blue-700',
    EN_VERIFICACION: 'bg-blue-100 text-blue-700',
    OBSERVADO: 'bg-red-100 text-red-700',
    APROBADO: 'bg-green-100 text-green-700',
    INSPECCION: 'bg-purple-100 text-purple-700',
    CERTIFICADO_EMITIDO: 'bg-emerald-100 text-emerald-700',
    ANULADO: 'bg-gray-200 text-gray-600',
  }
  return map[estado] || 'bg-gray-100 text-gray-700'
}

function formatearEstado(estado) {
  const map = {
    BORRADOR: 'Borrador',
    PENDIENTE_PAGO: 'P. Pago',
    PAGO_CONFIRMADO: 'Pago',
    EN_VERIFICACION: 'Verif.',
    OBSERVADO: 'Obs.',
    APROBADO: 'Aprob.',
    INSPECCION: 'Insp.',
    CERTIFICADO_EMITIDO: 'Cert.',
    ANULADO: 'Anulado',
  }
  return map[estado] || estado
}

onMounted(async () => {
  await cargar()
  await nextTick()
  inicializarMapa()
  renderizarMapa()
})

onBeforeUnmount(() => {
  if (mapa.value) {
    mapa.value.remove()
    mapa.value = null
  }
})

// Re-renderizar cuando cambia el modo
watch(modo, () => {
  if (mapa.value) renderizarMapa()
})
</script>

<style scoped>
/* Estilos personalizados para los marcadores */
:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

/* Popup personalizado */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  padding: 0;
}

:deep(.leaflet-popup-content) {
  margin: 12px;
  font-family: 'Inter', sans-serif;
}
</style>