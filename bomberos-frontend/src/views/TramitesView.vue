<script setup>
import { ref, computed } from 'vue'

// Filtro de búsqueda del usuario
const filtroBusqueda = ref('')

// Listado simulado de trámites ingresados por el profesional técnico
const tramites = ref([
  {
    id: 1,
    codigo: 'SIPPCI-2026-042',
    proyecto: 'Condominio Residencial "Los Pinos"',
    tipo: 'Infraestructura',
    fechaIngreso: '12 de Mayo, 2026',
    inspector: 'Tte. Ramos J.',
    estado: 'Aprobado'
  },
  {
    id: 2,
    codigo: 'SIPPCI-2026-089',
    proyecto: 'Centro Comercial "Norte Plaza"',
    tipo: 'Infraestructura',
    fechaIngreso: '02 de Junio, 2026',
    inspector: 'Cap. Mendoza L.',
    estado: 'En Inspección'
  },
  {
    id: 3,
    codigo: 'SIPPCI-2026-115',
    proyecto: 'Hotel Boutique "La Estancia"',
    tipo: 'Turismo',
    fechaIngreso: '18 de Junio, 2026',
    inspector: 'Subt. Quispe M.',
    estado: 'Observado'
  },
  {
    id: 4,
    codigo: 'SIPPCI-2026-140',
    proyecto: 'Galería Comercial "El Progreso"',
    tipo: 'Infraestructura',
    fechaIngreso: '29 de Junio, 2026',
    inspector: 'Por Asignar',
    estado: 'Pendiente'
  }
])

// Lógica para filtrar los trámites dinámicamente en pantalla
const tramitesFiltrados = computed(() => {
  return tramites.value.filter(t => 
    t.proyecto.toLowerCase().includes(filtroBusqueda.value.toLowerCase()) ||
    t.codigo.toLowerCase().includes(filtroBusqueda.value.toLowerCase())
  )
})

const getEstadoBadge = (estado) => {
  switch (estado) {
    case 'Aprobado': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'En Inspección': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Observado': return 'bg-rose-50 text-rose-700 border-rose-200'
    default: return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-12 md:py-16">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 mb-2 border border-red-100">
          Panel de Profesionales
        </span>
        <h1 class="text-2xl font-black tracking-tight text-slate-900">Seguimiento de Trámites SIPPCI</h1>
        <p class="text-xs text-slate-500 mt-1">
          Historial técnico de carpetas de infraestructura, turismo y polígonos gestionadas por su registro profesional.
        </p>
      </div>

      <div class="w-full md:w-72">
        <input 
          v-model="filtroBusqueda"
          type="text" 
          placeholder="Buscar por código o proyecto..." 
          class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 text-xs font-medium placeholder:text-slate-400"
        />
      </div>
    </div>

    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <th class="py-4 px-6">Código Único</th>
              <th class="py-4 px-6">Proyecto / Establecimiento</th>
              <th class="py-4 px-6">Sector</th>
              <th class="py-4 px-6">Fecha Ingreso</th>
              <th class="py-4 px-6">Inspector Asignado</th>
              <th class="py-4 px-6 text-center">Estado del Trámite</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            
            <tr v-for="tramite in tramitesFiltrados" :key="tramite.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="py-4 px-6 font-bold text-slate-900 tracking-tight">{{ tramite.codigo }}</td>
              <td class="py-4 px-6 text-slate-600">{{ tramite.proyecto }}</td>
              <td class="py-4 px-6">
                <span class="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-600">{{ tramite.tipo }}</span>
              </td>
              <td class="py-4 px-6 text-slate-400">{{ tramite.fechaIngreso }}</td>
              <td class="py-4 px-6">
                <span :class="tramite.inspector === 'Por Asignar' ? 'text-slate-400 italic' : 'text-slate-600 font-semibold'">
                  {{ tramite.inspector }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <span :class="['px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block min-w-[100px]', getEstadoBadge(tramite.estado)]">
                  {{ tramite.estado }}
                </span>
              </td>
            </tr>

            <tr v-if="tramitesFiltrados.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 font-medium italic">
                No se encontraron trámites que coincidan con la búsqueda introducida.
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>