<script setup>
import { ref } from 'vue'

// Métricas rápidas para el personal de Bomberos
const metricas = ref([
  { id: 1, titulo: 'Trámites Totales', valor: '1,248', cambio: '+12% este mes', color: 'text-slate-900', bg: 'bg-slate-50' },
  { id: 2, titulo: 'En Inspección', valor: '84', cambio: 'Asignados hoy', color: 'text-amber-600', bg: 'bg-amber-50/50' },
  { id: 3, titulo: 'Aprobados (SIPAB)', valor: '912', cambio: 'Firma digital lista', color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
  { id: 4, titulo: 'Observados', valor: '32', cambio: 'Requieren revisión', color: 'text-rose-600', bg: 'bg-rose-50/50' },
])

// Bandeja de inspecciones recientes pendientes de asignación o informe
const solicitudesRecientes = ref([
  { id: 1, correlativo: 'INF-2026-894', solicitante: 'YPFB Estación de Servicio', sector: 'Hidrocarburos', fecha: 'Hoy, 14:20', estado: 'Pendiente', urgencia: 'Alta' },
  { id: 2, correlativo: 'INF-2026-893', solicitante: 'Torre Empresarial "Illimani"', sector: 'Infraestructura', fecha: 'Hoy, 11:05', estado: 'Asignado', urgencia: 'Media' },
  { id: 3, correlativo: 'TUR-2026-112', solicitante: 'Hotel Plaza Real', sector: 'Turismo', fecha: 'Ayer', estado: 'Completado', urgencia: 'Baja' },
  { id: 4, correlativo: 'POL-2026-045', solicitante: 'Club de Tiro La Paz', sector: 'Polígonos', fecha: '28 Jun', estado: 'Pendiente', urgencia: 'Media' }
])

const getUrgenciaEstilo = (urgencia) => {
  switch (urgencia) {
    case 'Alta': return 'bg-rose-100 text-rose-700 font-bold'
    case 'Media': return 'bg-amber-100 text-amber-700'
    default: return 'bg-slate-100 text-slate-600'
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 flex flex-col md:flex-row">
    
    <!-- SIDEBAR DE ADMINISTRACIÓN -->
    <aside class="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      <div class="p-6 border-b border-slate-800 flex items-center gap-3">
        <div class="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">B</div>
        <div>
          <h2 class="text-xs font-black tracking-wider text-white uppercase">Panel Interno</h2>
          <p class="text-[10px] text-slate-500 font-medium">Dirección de Bomberos</p>
        </div>
      </div>
      
      <!-- Menú del Sidebar -->
      <nav class="flex-grow p-4 space-y-1 text-xs font-bold tracking-wide">
        <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800 text-white transition-all">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Bandeja de Entrada
        </a>
        <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-400">
          <span>📅</span> Calendario Inspecciones
        </a>
        <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-400">
          <span>👥</span> Personal / Inspectores
        </a>
        <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-400">
          <span>⚙️</span> Configuración SIPPCI
        </a>
      </nav>
      
      <div class="p-4 border-t border-slate-800 text-[10px] text-slate-500 font-medium text-center">
        Sesión: Operador Técnico
      </div>
    </aside>

    <!-- ÁREA DE CONTENIDO PRINCIPAL -->
    <main class="flex-grow p-6 md:p-8 space-y-6">
      
      <!-- Encabezado del Dashboard -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 class="text-xl font-black tracking-tight text-slate-900">Sistema Control de Prevención</h1>
          <p class="text-xs text-slate-500 mt-0.5">Monitoreo y asignación de inspecciones técnicas a nivel nacional.</p>
        </div>
        <div class="text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-xl self-start">
          Gestión Activa: 2026
        </div>
      </div>

      <!-- CARDS DE MÉTRICAS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="item in metricas" :key="item.id" :class="['p-5 rounded-2xl border border-slate-200/70 shadow-2xs bg-white', item.bg]">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{{ item.titulo }}</span>
          <span :class="['text-2xl font-black tracking-tight block mt-1', item.color]">{{ item.valor }}</span>
          <span class="text-[10px] text-slate-400 font-medium block mt-1">{{ item.cambio }}</span>
        </div>
      </div>

      <!-- BANDEJA DE SOLICITUDES RECIENTES -->
      <div class="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Últimas Carpetas Ingresadas</h3>
          <button class="text-[11px] font-bold text-red-600 hover:underline">Ver todas</button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/70 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th class="py-3 px-5">Nro. Trámite</th>
                <th class="py-3 px-5">Contribuyente / Empresa</th>
                <th class="py-3 px-5">Sector</th>
                <th class="py-3 px-5">Ingreso</th>
                <th class="py-3 px-5 text-center">Prioridad</th>
                <th class="py-3 px-5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              <tr v-for="solicitud in solicitudesRecientes" :key="solicitud.id" class="hover:bg-slate-50/40 transition-colors">
                <td class="py-3.5 px-5 font-bold text-slate-900">{{ solicitud.correlativo }}</td>
                <td class="py-3.5 px-5 text-slate-600">{{ solicitud.solicitante }}</td>
                <td class="py-3.5 px-5">
                  <span class="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-500">{{ solicitud.sector }}</span>
                </td>
                <td class="py-3.5 px-5 text-slate-400">{{ solicitud.fecha }}</td>
                <td class="py-3.5 px-5 text-center">
                  <span :class="['px-2 py-0.5 rounded text-[9px] font-bold', getUrgenciaEstilo(solicitud.urgencia)]">
                    {{ solicitud.urgencia }}
                  </span>
                </td>
                <td class="py-3.5 px-5 text-right">
                  <span :class="solicitud.estado === 'Pendiente' ? 'text-amber-600 font-bold' : 'text-slate-500'">
                    {{ solicitud.estado }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>
  </div>
</template>