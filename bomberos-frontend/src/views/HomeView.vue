<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'

// Control de sección activa para el colapso de información (0 = ninguna)
const seccionActiva = ref(0)

// Manejo de clics en los botones de secciones
const seleccionarSeccion = (id) => {
  if (id === 4) {
    // Alerta SweetAlert2 adaptada al estilo institucional
    Swal.fire({
      title: 'Módulo en Desarrollo',
      text: 'El sistema de control SIPPCI para el sector de Hidrocarburos se encuentra actualmente en proceso de aprobación de reglamento.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#dc2626', // El rojo de bomberos
      customClass: {
        popup: 'rounded-2xl font-sans text-sm',
        confirmButton: 'rounded-xl px-5 py-2.5 font-semibold text-sm'
      }
    })
    return
  }
  
  // Alternar visualización del panel inferior
  seccionActiva.value = seccionActiva.value === id ? 0 : id
}
</script>

<template>
  <div class="w-full flex flex-col items-center">
    
    <div 
      class="w-full h-[400px] bg-slate-950 bg-cover bg-center relative shadow-2xl shadow-slate-950/40 border-b border-slate-800/40 flex flex-col justify-center items-center px-6 text-center"
      style="background-image: linear-gradient(to top, rgba(2, 6, 23, 0.95), rgba(2, 6, 23, 0.6)), url('https://images.unsplash.com/photo-1516546453174-5f10006279f0?auto=format&fit=crop&w=1600&q=80');"
    >
      <div class="max-w-3xl flex flex-col items-center">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-600/10 text-red-400 mb-4 border border-red-500/20">
          <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
          Dirección Nacional de Bomberos
        </span>
        
        <h1 class="text-white text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
          Al servicio de la comunidad con valor, disciplina y lealtad
        </h1>
        
        <p class="text-sm text-slate-300 mt-3 max-w-xl font-medium">
          Plataforma tecnológica institucional para la validación y seguimiento de trámites ciudadanos en tiempo real.
        </p>
      </div>
    </div>

    <section class="max-w-4xl w-full mx-auto px-6 py-12 md:py-16 flex flex-col items-center -mt-16 relative z-20">
      
      <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        
        <button 
          @click="seleccionarSeccion(1)" 
          :class="['group text-left border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between min-h-[120px] cursor-pointer w-full', seccionActiva === 1 ? 'border-red-600 bg-red-50/10 shadow-sm' : 'bg-white border-slate-200/80 hover:shadow-md hover:border-red-500/40']"
        >
          <div>
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors', seccionActiva === 1 ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white']">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 16.5h1.5m3 0H15" />
              </svg>
            </div>
            <h3 class="text-[20px] font-bold text-slate-800 tracking-tight group-hover:text-red-600 transition-colors">SIPPCI</h3>
            <p class="text-[15px] text-slate-400 mt-1 leading-normal">Infraestructura</p>
          </div>
        </button>

        <button 
          @click="seleccionarSeccion(2)" 
          :class="['group text-left border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between min-h-[120px] cursor-pointer w-full', seccionActiva === 2 ? 'border-red-600 bg-red-50/10 shadow-sm' : 'bg-white border-slate-200/80 hover:shadow-md hover:border-red-500/40']"
        >
          <div>
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors', seccionActiva === 2 ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white']">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21l-9-5 2-11 10-2 6 7-9 11z" />
                <circle cx="12" cy="21" r="1" fill="currentColor"/>
                <circle cx="3" cy="16" r="1" fill="currentColor"/>
                <circle cx="5" cy="5" r="1" fill="currentColor"/>
                <circle cx="15" cy="3" r="1" fill="currentColor"/>
                <circle cx="21" cy="10" r="1" fill="currentColor"/>
              </svg>
            </div>
            <h3 class="text-[18px] font-bold text-slate-800 tracking-tight group-hover:text-red-600 transition-colors">REGLAMENTACION</h3>
            <p class="text-[15px] text-slate-400 mt-1 leading-normal">Armería, Campos y Polígonos de Tiro.</p>
          </div>
        </button>

        <button 
          @click="seleccionarSeccion(3)" 
          :class="['group text-left border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between min-h-[120px] cursor-pointer w-full', seccionActiva === 3 ? 'border-red-600 bg-red-50/10 shadow-sm' : 'bg-white border-slate-200/80 hover:shadow-md hover:border-red-500/40']"
        >
          <div>
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors', seccionActiva === 3 ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white']">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5" />
              </svg>
            </div>
            <h3 class="text-[18px] font-bold text-slate-800 tracking-tight group-hover:text-red-600 transition-colors">REGLAMENTACION</h3>
            <p class="text-[15px] text-slate-400 mt-1 leading-normal">Turismo</p>
          </div>
        </button>

        <button 
          @click="seleccionarSeccion(4)" 
          class="group text-left bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-red-500/40 transition-all flex flex-col justify-between min-h-[120px] cursor-pointer w-full"
        >
          <div>
            <div class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-5.25 7.5-6 9.75-6 12.75a6 6 0 0012 0c0-3-.75-5.25-6-12.75z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c-1 1.5-1.5 2.5-1.5 3.5" />
              </svg>
            </div>
            <h3 class="text-[18px] font-bold text-slate-800 tracking-tight group-hover:text-red-600 transition-colors">REGLAMENTACION</h3>
            <p class="text-[15px] text-slate-400 mt-1 leading-normal">Hidrocarburos</p>
            <p class="text-[11px] text-slate-400 mt-1 leading-normal">En aprobación de reglamento</p>
          </div>
        </button>

      </div>

      <div v-if="seccionActiva > 0" class="w-full mt-6 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm border-t-red-600 border-t-2 transition-all duration-300">
        
        <div v-if="seccionActiva === 1" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div class="space-y-2 max-w-2xl">
            <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              SIPPCI - Inspección de Infraestructuras
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Gestión y revisión técnica de planos de evacuación, sistemas fijos contra incendios, señalización reglamentaria y extintores para todo tipo de edificaciones comerciales, industriales y multifamiliares.
            </p>
          </div>
          <div class="flex flex-wrap sm:flex-nowrap gap-2">
            <RouterLink 
              to="/registro-profesional/registro-de-profesionales" 
              class="inline-flex items-center justify-center bg-red-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs gap-2 group/btn"
            >
              <span>Registro de Profesionales</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </RouterLink>
            
            <RouterLink 
              to="/registro-profesional/capacitacion" 
              class="inline-flex items-center justify-center bg-red-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs gap-2 group/btn"
            >
              <span>Capacitación</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </RouterLink>

            <RouterLink 
              to="/registro-profesional/cumplimiento-sippci" 
              class="inline-flex items-center justify-center bg-red-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs gap-2 group/btn"
            >
              <span>Cumplimiento al SIPPCI</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </RouterLink>
          </div>
        </div>

        <div v-if="seccionActiva === 2" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div class="space-y-2 max-w-2xl">
            <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              REGLAMENTACION - Armerías, Campos y Polígonos de Tiro
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Certificación especializada en medidas de seguridad pasiva y activa para instalaciones de almacenamiento de armamento, así como la delimitación técnica y protección perimetral en campos de entrenamiento y polígonos.
            </p>
          </div>
          <div class="flex flex-wrap sm:flex-nowrap gap-2">
            <RouterLink 
              to="/registro-profesional/armeria" 
              class="inline-flex items-center justify-center bg-red-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs gap-2 group/btn"
            >
              <span>Armería</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </RouterLink>

            <RouterLink 
              to="/registro-profesional/campos-de-tiro" 
              class="inline-flex items-center justify-center bg-red-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs gap-2 group/btn"
            >
              <span>Campos de Tiro</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </RouterLink>

            <RouterLink 
              to="/registro-profesional/poligono-de-tiro" 
              class="inline-flex items-center justify-center bg-red-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs gap-2 group/btn"
            >
              <span>Polígonos de Tiro</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </RouterLink>
          </div>
        </div>

        <div v-if="seccionActiva === 3" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div class="space-y-2 max-w-2xl">
            <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              REGLAMENTACION - Sector Turismo y Hotelería
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Planes de contingencia y normativas de protección contra incendios adaptadas a establecimientos hoteleros, hospedajes y centros de gran afluencia de visitantes para resguardar la seguridad del turismo nacional e internacional.
            </p>
          </div>
          <div class="flex flex-wrap sm:flex-nowrap gap-2">
            <RouterLink 
              to="/registro-profesional/actividades-aereas" 
              class="inline-flex items-center justify-center bg-red-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs gap-2 group/btn"
            >
              <span>Actividades Aéreas</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </RouterLink>

            <RouterLink 
              to="/registro-profesional/actividades-acuaticas" 
              class="inline-flex items-center justify-center bg-red-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs gap-2 group/btn"
            >
              <span>Actividades Acuáticas</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </RouterLink>

            <RouterLink 
              to="/registro-profesional/actividades-terrestres" 
              class="inline-flex items-center justify-center bg-red-600 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs gap-2 group/btn"
            >
              <span>Actividades Terrestres</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </RouterLink>
          </div>
        </div>

      </div>

    </section>
  </div>
</template>