<template>
  <aside class="fixed left-0 top-0 h-full w-72 bg-dnb-dark text-white z-50 flex flex-col justify-between shadow-lg">
    <!-- Header del sidebar -->
    <div class="flex flex-col flex-1 overflow-y-auto">
      <div class="px-4 py-4 flex items-center gap-3 bg-dnb-dark border-b border-white/10">
        <div class="w-10 h-10 rounded-lg bg-dnb-primary flex items-center justify-center flex-shrink-0">
          <span class="text-white text-xl font-bold">🚒</span>
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-white leading-tight">SIPPCI V2.0</span>
          <span class="text-[10px] text-white/60 uppercase tracking-wider">DNB Bomberos</span>
        </div>
      </div>

      <!-- Navegación -->
      <div class="px-4 pt-4 pb-2">
        <span class="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Operaciones y Control</span>
      </div>

      <nav class="px-2 flex flex-col gap-1">
        <!-- Dashboard -->
        <RouterLink
          to="/admin/dashboard"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          :class="isActive('/admin/dashboard') ? 'bg-dnb-primary text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">grid_view</span>
          <span class="text-sm flex-1">Inicio (Dashboard)</span>
        </RouterLink>

        <!-- Solicitudes (con submenú) -->
        <div v-if="puedeVer('solicitudes')" class="flex flex-col gap-1">
          <div
            @click="toggleSubmenu('solicitudes')"
            class="flex items-center justify-between px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[20px]">folder_shared</span>
              <span class="text-sm">Solicitudes</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="px-2 py-0.5 rounded-full bg-dnb-primary text-white text-[10px] font-bold">28</span>
              <span class="material-symbols-outlined text-[16px] transition-transform" :class="submenus.solicitudes ? 'rotate-180' : ''">expand_more</span>
            </div>
          </div>

          <div v-show="submenus.solicitudes" class="pl-8 pr-1 flex flex-col gap-0.5">
            <RouterLink
              to="/admin/solicitudes?estado=BORRADOR"
              class="flex items-center justify-between px-2 py-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white text-xs transition-colors"
            >
              <span>Pendientes</span>
              <span class="text-dnb-primary font-semibold">12</span>
            </RouterLink>
            <RouterLink
              to="/admin/solicitudes?estado=EN_VERIFICACION"
              class="flex items-center justify-between px-2 py-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white text-xs transition-colors"
            >
              <span>En Revisión</span>
              <span class="text-blue-300 font-semibold">8</span>
            </RouterLink>
            <RouterLink
              to="/admin/solicitudes?estado=OBSERVADO"
              class="flex items-center justify-between px-2 py-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white text-xs transition-colors"
            >
              <span>Observados</span>
              <span class="text-red-400 font-semibold">5</span>
            </RouterLink>
            <RouterLink
              to="/admin/solicitudes?estado=APROBADO"
              class="flex items-center justify-between px-2 py-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white text-xs transition-colors"
            >
              <span>Aprobados</span>
              <span class="text-gray-300 font-semibold">3</span>
            </RouterLink>
          </div>
        </div>

        <!-- Capacitaciones -->
        <RouterLink
          v-if="puedeVer('capacitaciones')"
          to="/admin/capacitaciones"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          :class="isActive('/admin/capacitaciones') ? 'bg-dnb-primary text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">school</span>
          <span class="text-sm flex-1">Capacitaciones</span>
        </RouterLink>

        <!-- Reportes -->
        <RouterLink
          v-if="puedeVer('reportes')"
          to="/admin/reportes"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          :class="isActive('/admin/reportes') ? 'bg-dnb-primary text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">query_stats</span>
          <span class="text-sm flex-1">Reportes y Estadísticas</span>
        </RouterLink>

        <RouterLink
          v-if="puedeVer('mapa')"
          to="/admin/mapa"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          :class="isActive('/admin/mapa') ? 'bg-dnb-primary text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">map</span>
          <span class="text-sm flex-1">Mapa de Solicitudes</span>
        </RouterLink>

        <!-- Certificados -->
        <RouterLink
          v-if="puedeVer('certificados')"
          to="/admin/certificados"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          :class="isActive('/admin/certificados') ? 'bg-dnb-primary text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">verified</span>
          <span class="text-sm flex-1">Certificados</span>
        </RouterLink>

        <!-- Inspecciones -->
        <RouterLink
          v-if="puedeVer('inspecciones')"
          to="/admin/inspecciones"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          :class="isActive('/admin/inspecciones') ? 'bg-dnb-primary text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">fact_check</span>
          <span class="text-sm flex-1">Inspecciones</span>
        </RouterLink>

        <!-- Administración -->
        <div class="px-4 pt-4 pb-2">
          <span class="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Administración Sistema</span>
        </div>

        <RouterLink
          v-if="puedeVer('usuarios')"
          to="/admin/usuarios-permisos"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          :class="isActive('/admin/usuarios-permisos') ? 'bg-dnb-primary text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">manage_accounts</span>
          <span class="text-sm flex-1">Usuarios y Permisos</span>
        </RouterLink>

        <RouterLink
          v-if="puedeVer('configuracion')"
          to="/admin/configuracion-sippci"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          :class="isActive('/admin/configuracion-sippci') ? 'bg-dnb-primary text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">tune</span>
          <span class="text-sm flex-1">Configuración SIPPCI</span>
        </RouterLink>
      </nav>
    </div>

    <!-- Footer del sidebar: Usuario -->
    <div class="p-4 bg-dnb-dark border-t border-white/10">
      <div class="p-3 rounded-lg bg-white text-gray-800 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-dnb-primary"></span>
            {{ usuario.rol || 'ADMIN' }}
          </span>
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            <span class="text-[10px] text-gray-500 font-semibold">En línea</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold text-gray-900 truncate">{{ usuario.nombre }}</span>
            <span class="text-[10px] text-gray-500 truncate">{{ usuario.email }}</span>
          </div>
          <button
            @click="$emit('logout')"
            class="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors flex-shrink-0"
            title="Cerrar sesión"
          >
            <span class="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

defineEmits(['logout'])

const route = useRoute()

const submenus = ref({
  solicitudes: false,
})

function toggleSubmenu(nombre) {
  submenus.value[nombre] = !submenus.value[nombre]
}

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

const usuario = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return { nombre: 'Usuario', email: '', rol: 'ADMIN' }
  }
})

const rol = computed(() => usuario.value.rol || 'ADMIN')

/**
 * Verifica si el usuario actual puede ver una sección según su rol
 */
function puedeVer(seccion) {
  const permisosPorRol = {
    ADMIN: ['solicitudes', 'capacitaciones', 'reportes', 'certificados', 'inspecciones', 'usuarios', 'configuracion'],
    INSPECTOR: ['solicitudes', 'reportes', 'certificados', 'inspecciones'],
    CAJERO: ['solicitudes', 'reportes', 'certificados'],
    SUPERVISOR: ['solicitudes', 'capacitaciones', 'reportes', 'certificados', 'inspecciones'],
    TECNICO_VERIFICADOR: ['solicitudes', 'certificados', 'inspecciones'],
  }
  return permisosPorRol[rol.value]?.includes(seccion) || false
}
</script>