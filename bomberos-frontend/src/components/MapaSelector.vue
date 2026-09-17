<template>
  <div class="mapa-selector">
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <label class="block text-xs font-semibold text-gray-700">
        {{ label }}
        <span v-if="!obligatorio" class="text-gray-400 font-normal">(opcional)</span>
      </label>
      <div v-if="lat && lng" class="flex items-center gap-2">
        <span class="text-[10px] text-gray-500 font-mono">
          {{ lat.toFixed(6) }}, {{ lng.toFixed(6) }}
        </span>
        <button
          type="button"
          @click="limpiar"
          class="text-[10px] text-red-600 hover:text-red-700 font-semibold"
        >
          Limpiar
        </button>
      </div>
    </div>

    <!-- BÃºsqueda por direcciÃ³n (opcional) -->
    <div class="flex gap-2 mb-2">
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar direcciÃ³n (opcional)..."
        class="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-dnb-primary/30"
        @keyup.enter="buscarDireccion"
      />
      <button
        type="button"
        @click="buscarDireccion"
        :disabled="buscando || !busqueda"
        class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors disabled:opacity-50"
      >
        <span class="material-symbols-outlined text-[16px]">search</span>
      </button>
      <button
        type="button"
        @click="usarMiUbicacion"
        :disabled="obteniendoUbicacion"
        class="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
        title="Usar mi ubicaciÃ³n actual"
      >
        <span v-if="obteniendoUbicacion" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
        <span v-else class="material-symbols-outlined text-[16px]">my_location</span>
      </button>
    </div>

    <!-- Mapa -->
    <div
      ref="mapContainer"
      class="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200"
      :class="{ 'opacity-50': deshabilitado }"
    ></div>

    <!-- Instrucciones -->
    <p class="text-[10px] text-gray-500 mt-1">
      <span class="material-symbols-outlined text-[12px] align-middle">info</span>
      Haga click en el mapa para marcar la ubicaciÃ³n exacta. Arrastre el pin para ajustar.
    </p>

    <!-- Mensaje de error -->
    <p v-if="error" class="text-[10px] text-red-600 mt-1">{{ error }}</p>

    <!-- DirecciÃ³n seleccionada -->
    <div v-if="direccionSeleccionada" class="mt-2 p-2 bg-blue-50 rounded-lg">
      <p class="text-[10px] text-blue-800">
        <strong>DirecciÃ³n:</strong> {{ direccionSeleccionada }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import L from 'leaflet'

const props = defineProps({
  label: {
    type: String,
    default: 'UbicaciÃ³n exacta en el mapa',
  },
  obligatorio: {
    type: Boolean,
    default: false,
  },
  modeloLat: {
    type: Number,
    default: null,
  },
  modeloLng: {
    type: Number,
    default: null,
  },
  centroLat: {
    type: Number,
    default: -16.5,
  },
  centroLng: {
    type: Number,
    default: -64.5,
  },
  zoomInicial: {
    type: Number,
    default: 5,
  },
  deshabilitado: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modeloLat', 'update:modeloLng', 'cambio'])

const mapContainer = ref(null)
const mapa = ref(null)
const marcador = ref(null)

const lat = ref(props.modeloLat)
const lng = ref(props.modeloLng)
const busqueda = ref('')
const buscando = ref(false)
const obteniendoUbicacion = ref(false)
const direccionSeleccionada = ref('')
const error = ref('')

function inicializarMapa() {
  if (!mapContainer.value || mapa.value) return

  mapa.value = L.map(mapContainer.value, {
    center: lat.value || props.centroLat ? [lat.value || props.centroLat, lng.value || props.centroLng] : [props.centroLat, props.centroLng],
    zoom: lat.value ? 15 : props.zoomInicial,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Â© OpenStreetMap',
    maxZoom: 19,
  }).addTo(mapa.value)

  if (lat.value && lng.value) {
    crearMarcador(lat.value, lng.value)
  }

  mapa.value.on('click', (e) => {
    if (props.deshabilitado) return
    crearMarcador(e.latlng.lat, e.latlng.lng)
  })
}

function crearMarcador(nuevaLat, nuevaLng) {
  if (marcador.value) {
    marcador.value.remove()
  }

  const icono = L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background: #C41E3A;
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })

  marcador.value = L.marker([nuevaLat, nuevaLng], {
    icon: icono,
    draggable: !props.deshabilitado,
  }).addTo(mapa.value)

  marcador.value.on('dragend', (e) => {
    const { lat: dragLat, lng: dragLng } = e.target.getLatLng()
    actualizarCoordenadas(dragLat, dragLng)
  })

  actualizarCoordenadas(nuevaLat, nuevaLng)
}

function actualizarCoordenadas(nuevaLat, nuevaLng) {
  lat.value = nuevaLat
  lng.value = nuevaLng

  emit('update:modeloLat', nuevaLat)
  emit('update:modeloLng', nuevaLng)
  emit('cambio', { lat: nuevaLat, lng: nuevaLng })

  obtenerDireccion(nuevaLat, nuevaLng)
}

async function obtenerDireccion(latV, lngV) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latV}&lon=${lngV}&accept-language=es&addressdetails=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SIPPCI-DNB/2.1' },
    })
    
    if (!res.ok) throw new Error('Error en reverse geocoding')

    const data = await res.json()
    
    if (!data || !data.address) {
      direccionSeleccionada.value = ''
      return
    }

    const addr = data.address

    // Extraer campos con fallbacks
    const direccion = {
      display_name: data.display_name || '',
      ciudad: addr.city || addr.town || addr.village || addr.hamlet || '',
      departamento: addr.state || addr.region || '',
      provincia: addr.county || addr.state_district || '',
      municipio: addr.municipality || addr.city_district || addr.city || '',
    }

    direccionSeleccionada.value = direccion.display_name

    // Emitir al padre
    emit('direccion-seleccionada', direccion)
  } catch (e) {
    console.error('Error reverse geocoding:', e)
    direccionSeleccionada.value = ''
    // No bloquear: la ubicaciÃ³n se guarda igual, solo no se autocompleta
  }
}

async function buscarDireccion() {
  if (!busqueda.value.trim()) return

  buscando.value = true
  error.value = ''
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda.value)}&limit=1&accept-language=es`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SIPPCI-DNB/2.1' },
    })
    if (!res.ok) throw new Error('Error en bÃºsqueda')

    const data = await res.json()
    if (data.length === 0) {
      error.value = 'No se encontrÃ³ la direcciÃ³n'
      return
    }

    const { lat: nuevaLat, lon: nuevaLng, display_name } = data[0]
    const latNum = parseFloat(nuevaLat)
    const lngNum = parseFloat(nuevaLng)

    mapa.value.setView([latNum, lngNum], 15, { animate: true })
    crearMarcador(latNum, lngNum)
    direccionSeleccionada.value = display_name || ''
  } catch (e) {
    error.value = 'Error al buscar la direcciÃ³n'
  } finally {
    buscando.value = false
  }
}

function usarMiUbicacion() {
  if (!navigator.geolocation) {
    error.value = 'GeolocalizaciÃ³n no soportada por el navegador'
    return
  }

  obteniendoUbicacion.value = true
  error.value = ''

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      mapa.value.setView([latitude, longitude], 16, { animate: true })
      crearMarcador(latitude, longitude)
      obteniendoUbicacion.value = false
    },
    (err) => {
      error.value = 'No se pudo obtener la ubicaciÃ³n: ' + err.message
      obteniendoUbicacion.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

function limpiar() {
  if (marcador.value) {
    marcador.value.remove()
    marcador.value = null
  }
  lat.value = null
  lng.value = null
  direccionSeleccionada.value = ''
  busqueda.value = ''
  error.value = ''

  emit('update:modeloLat', null)
  emit('update:modeloLng', null)
  emit('cambio', null)

  if (mapa.value) {
    mapa.value.setView([props.centroLat, props.centroLng], props.zoomInicial)
  }
}

onMounted(() => {
  nextTick(() => {
    inicializarMapa()
  })
})

onBeforeUnmount(() => {
  if (mapa.value) {
    mapa.value.remove()
    mapa.value = null
  }
})

watch(
  () => [props.modeloLat, props.modeloLng],
  ([nuevaLat, nuevaLng]) => {
    if (nuevaLat !== lat.value || nuevaLng !== lng.value) {
      lat.value = nuevaLat
      lng.value = nuevaLng
      if (mapa.value && nuevaLat && nuevaLng) {
        mapa.value.setView([nuevaLat, nuevaLng], 15)
        crearMarcador(nuevaLat, nuevaLng)
      }
    }
  },
)
</script>

<style scoped>
:deep(.custom-pin) {
  background: transparent !important;
  border: none !important;
}
</style>



