<template>
  <div class="max-w-6xl mx-auto px-6 py-12 md:py-16">
    <div class="text-center max-w-2xl mx-auto mb-10">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 mb-4 border border-red-100">
        Nuestras Estaciones
      </span>
      <h1 class="text-3xl font-black tracking-tight text-slate-900 mb-3">Ubicación y Despliegue</h1>
      <p class="text-sm text-slate-500 leading-relaxed">
        Encuentre la dirección de la Dirección Nacional o las estaciones de bomberos distribuidas para la atención de su sector.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div class="space-y-4">
        <div class="bg-white p-5 border border-slate-200/80 rounded-xl shadow-xs border-l-4 border-l-red-600">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Dirección Nacional</h3>
          <p class="text-xs text-slate-600 mt-1.5">Oficinas Centrales de Fiscalización y Certificación SIPPCI.</p>
          <p class="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" /></svg>
            Edificio Central, La Paz, Bolivia
          </p>
        </div>

        <div class="bg-white p-5 border border-slate-200/80 rounded-xl shadow-xs">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Estación Central Antofagasta</h3>
          <p class="text-xs text-slate-500 mt-1.5">Unidad Operativa y atención de emergencias mayores.</p>
        </div>

        <div class="bg-white p-5 border border-slate-200/80 rounded-xl shadow-xs">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Estación Zona Sur</h3>
          <p class="text-xs text-slate-500 mt-1.5">Cuadrante de respuesta rápida para el sector sur.</p>
        </div>
      </div>

      <div class="lg:col-span-2 h-96 bg-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/80 border border-slate-200 relative">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15301.23456789012!2d-68.1234567890123!3d-16.5000000000000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sbo!4v1234567890123" 
          class="w-full h-full border-0 grayscale opacity-80" 
          allowfullscreen="" 
          loading="lazy"
        ></iframe>
      </div>
    </div>
  </div>
</template>