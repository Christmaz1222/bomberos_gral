<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col justify-between">
    
    <header v-if="$route.meta.public" class="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-xs">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3 font-bold text-base tracking-tight text-slate-900 shrink-0">
          <div class="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-red-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-red-600 font-medium">DIRECCION NACIONAL DE BOMBEROS</span>
        </div>
        
        <nav class="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <RouterLink to="/" class="hover:text-red-600 transition-colors" active-class="text-red-600">Inicio</RouterLink>
          <RouterLink to="/historia" class="hover:text-red-600 transition-colors" active-class="text-red-600">Historia</RouterLink>
          <RouterLink to="/ubicacion" class="hover:text-red-600 transition-colors" active-class="text-red-600">Ubicación</RouterLink>
          <RouterLink to="/contactos" class="hover:text-red-600 transition-colors" active-class="text-red-600">Contactos</RouterLink>
          <RouterLink to="/tramites" class="hover:text-red-600 transition-colors" active-class="text-red-600">Trámites</RouterLink>
          <span class="h-4 w-px bg-slate-200"></span>
          <RouterLink
              to="/login"
              class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl normal-case font-semibold tracking-normal transition-all shadow-sm"
             >
              Ingreso
             </RouterLink>
        </nav>
      </div>
    </header>

    <main :class="['w-full', $route.meta.public ? 'flex-grow' : '']">
      <RouterView />
    </main>

    <footer v-if="$route.meta.public" class="w-full bg-white border-t border-slate-200/60 py-4 text-center text-[11px] text-slate-400 font-medium">
      &copy; 2026 Dirección Nacional de Bomberos. Todos los derechos reservados.
    </footer>

  </div>
</template>