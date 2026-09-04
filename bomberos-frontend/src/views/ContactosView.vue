<template>
  <div class="max-w-4xl mx-auto px-6 py-12 md:py-16">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 mb-4 border border-rose-100">
        <span class="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping"></span>
        Líneas de Atención
      </span>
      <h1 class="text-3xl font-black tracking-tight text-slate-900 mb-3">Canales de Contacto</h1>
      <p class="text-sm text-slate-500 leading-relaxed">
        Comuníquese con soporte técnico del sistema SIPPCI o tome contacto directo con nuestras centrales de despacho.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-bold text-red-400 uppercase tracking-widest">Emergencias Nacionales</span>
          <h2 class="text-3xl font-black tracking-tight text-white mt-2">Línea 119</h2>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Disponible las 24 horas del día, los 7 días de la semana para atención inmediata de siniestros, rescates e incendios.
          </p>
        </div>
        <div class="border-t border-slate-800 pt-4 mt-6 text-[11px] text-slate-500 font-medium">
          Llamada gratuita desde cualquier operador de telefonía móvil o fija.
        </div>
      </div>

      <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Soporte Técnico SIPPCI</h3>
        <form class="space-y-3" @submit.prevent>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre Completo</label>
            <input type="text" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-red-600" placeholder="Ej. Juan Pérez">
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Correo Electrónico</label>
            <input type="email" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-red-600" placeholder="juan@ejemplo.com">
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mensaje o Requerimiento</label>
            <textarea rows="3" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-red-600" placeholder="Describa su inquietud técnica..."></textarea>
          </div>
          <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-xs">
            Enviar Mensaje
          </button>
        </form>
      </div>
    </div>
  </div>
</template>