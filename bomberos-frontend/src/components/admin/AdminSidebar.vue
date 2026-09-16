<script setup>
import { ref, onMounted } from 'vue'
import { usePermisos } from '../../composables/usePermisos.js'
import { dashboardMockService } from '../../services/dashboard.mock.service.js'

const {
  puedeVerPanelPrincipal,
  puedeVerSolicitudes,
  puedeVerReportes,
  puedeVerCapacitaciones,
  puedeVerUsuarios,
  puedeVerConfiguracion,
  puedeVerAuditoria,
} = usePermisos()

const submenuSolicitudesAbierto = ref(false)
const submenuSippciAbierto = ref(false)
const submenuCapacitacionesAbierto = ref(false)
const submenuUsuariosAbierto = ref(false)

const contadores = ref({ sippci: 0, reglamentacion: 0, turismo: 0 })

onMounted(async () => {
  contadores.value = await dashboardMockService.getContadoresSidebar()
})
</script>

<template>
  <aside
    class="fixed left-0 top-0 h-full w-72 bg-bomberos-navy text-white shadow-[0_1px_8px_rgba(0,0,0,0.08)] z-50 flex flex-col justify-between overflow-y-auto admin-sidebar"
  >
    <div>
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div class="w-10 h-10 rounded-lg bg-bomberos-red flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-[24px]">local_fire_department</span>
        </div>
        <div>
          <h1 class="font-bold text-sm tracking-tight">SIPPCI Admin</h1>
          <p class="text-xs text-white/60">DNB - Policía Boliviana</p>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="px-3 py-4 flex flex-col gap-1">
        <!-- A) Panel Principal -->
        <RouterLink
          v-if="puedeVerPanelPrincipal"
          to="/admin/dashboard"
          active-class="bg-bomberos-red text-white font-semibold"
          class="sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">dashboard</span>
          Panel Principal
        </RouterLink>

        <!-- B) Solicitudes -->
        <div v-if="puedeVerSolicitudes">
          <button
            class="sidebar-toggle w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
            @click="submenuSolicitudesAbierto = !submenuSolicitudesAbierto"
          >
            <span class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[20px]">description</span>
              Solicitudes
            </span>
            <span
              class="material-symbols-outlined text-[18px] transition-transform"
              :class="{ 'rotate-180 chevron-rotated': submenuSolicitudesAbierto }"
              >expand_more</span
            >
          </button>

          <div v-if="submenuSolicitudesAbierto" class="ml-4 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
            <!-- SIPPCI -->
            <button
              class="sidebar-toggle w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
              @click="submenuSippciAbierto = !submenuSippciAbierto"
            >
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">verified_user</span>
                SIPPCI
              </span>
              <span class="flex items-center gap-2">
                <span class="sidebar-badge bg-bomberos-red text-white">{{ contadores.sippci }}</span>
                <span
                  class="material-symbols-outlined text-[16px] transition-transform"
                  :class="{ 'rotate-180 chevron-rotated': submenuSippciAbierto }"
                  >expand_more</span
                >
              </span>
            </button>

            <div v-if="submenuSippciAbierto" class="ml-2 flex flex-col gap-2 py-1 text-xs">
              <!-- Reg. Profesionales -->
              <div>
                <p class="px-3 py-1 font-semibold text-white/50 uppercase tracking-wider text-[11px]">Reg. Profesionales</p>
                <RouterLink to="/admin/solicitudes/sippci/profesionales" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-1.5 rounded-lg hover:bg-white/10">Todas</RouterLink>
                <RouterLink to="/admin/solicitudes/sippci/profesionales/natural" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-1.5 rounded-lg hover:bg-white/10">Persona Natural</RouterLink>
                <RouterLink to="/admin/solicitudes/sippci/profesionales/juridica" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-1.5 rounded-lg hover:bg-white/10">Persona Jurídica</RouterLink>
              </div>
              <!-- Cumplimiento -->
              <div>
                <p class="px-3 py-1 font-semibold text-white/50 uppercase tracking-wider text-[11px]">Cumplimiento</p>
                <RouterLink to="/admin/solicitudes/sippci/cumplimiento/certificacion" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-1.5 rounded-lg hover:bg-white/10">Certificación</RouterLink>
                <RouterLink to="/admin/solicitudes/sippci/cumplimiento/declaracion" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-1.5 rounded-lg hover:bg-white/10">Declaración Jurada</RouterLink>
                <RouterLink to="/admin/solicitudes/sippci/cumplimiento/renovacion" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-1.5 rounded-lg hover:bg-white/10">Renovación</RouterLink>
              </div>
            </div>

            <!-- Reglamentación -->
            <RouterLink
              to="/admin/solicitudes/reglamentacion"
              active-class="bg-bomberos-red text-white font-semibold"
              class="sidebar-nav-item flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-white/10"
            >
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">gavel</span>
                Reglamentación
              </span>
              <span class="sidebar-badge bg-white/20 text-white">{{ contadores.reglamentacion }}</span>
            </RouterLink>

            <!-- Turismo -->
            <RouterLink
              to="/admin/solicitudes/turismo"
              active-class="bg-bomberos-red text-white font-semibold"
              class="sidebar-nav-item flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-white/10"
            >
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">flight</span>
                Turismo
              </span>
              <span class="sidebar-badge bg-white/20 text-white">{{ contadores.turismo }}</span>
            </RouterLink>
          </div>
        </div>

        <!-- C) Reportes -->
        <RouterLink
          v-if="puedeVerReportes"
          to="/admin/reportes"
          active-class="bg-bomberos-red text-white font-semibold"
          class="sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">bar_chart</span>
          Reportes
        </RouterLink>

        <!-- D) Capacitaciones -->
        <div v-if="puedeVerCapacitaciones">
          <button
            class="sidebar-toggle w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
            @click="submenuCapacitacionesAbierto = !submenuCapacitacionesAbierto"
          >
            <span class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[20px]">school</span>
              Capacitaciones
            </span>
            <span
              class="material-symbols-outlined text-[18px] transition-transform"
              :class="{ 'rotate-180 chevron-rotated': submenuCapacitacionesAbierto }"
              >expand_more</span
            >
          </button>
          <div v-if="submenuCapacitacionesAbierto" class="ml-4 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
            <RouterLink to="/admin/capacitaciones/cursos" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-2 rounded-lg text-sm hover:bg-white/10">Cursos</RouterLink>
            <RouterLink to="/admin/capacitaciones/programar" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-2 rounded-lg text-sm hover:bg-white/10">Programar</RouterLink>
            <RouterLink to="/admin/capacitaciones/inscripciones" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-2 rounded-lg text-sm hover:bg-white/10">Inscripciones</RouterLink>
            <RouterLink to="/admin/capacitaciones/calificar" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-2 rounded-lg text-sm hover:bg-white/10">Calificar</RouterLink>
            <RouterLink to="/admin/capacitaciones/certificados" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-2 rounded-lg text-sm hover:bg-white/10">Certificados</RouterLink>
          </div>
        </div>

        <!-- E) Usuarios -->
        <div v-if="puedeVerUsuarios">
          <button
            class="sidebar-toggle w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
            @click="submenuUsuariosAbierto = !submenuUsuariosAbierto"
          >
            <span class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[20px]">group</span>
              Usuarios
            </span>
            <span
              class="material-symbols-outlined text-[18px] transition-transform"
              :class="{ 'rotate-180 chevron-rotated': submenuUsuariosAbierto }"
              >expand_more</span
            >
          </button>
          <div v-if="submenuUsuariosAbierto" class="ml-4 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
            <RouterLink to="/admin/usuarios/internos" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-2 rounded-lg text-sm hover:bg-white/10">Internos</RouterLink>
            <RouterLink to="/admin/usuarios/externos" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-2 rounded-lg text-sm hover:bg-white/10">Externos</RouterLink>
            <RouterLink to="/admin/usuarios/empresas" active-class="bg-bomberos-red text-white font-semibold" class="sidebar-nav-item block px-3 py-2 rounded-lg text-sm hover:bg-white/10">Empresas</RouterLink>
          </div>
        </div>

        <!-- F) Configuración -->
        <RouterLink
          v-if="puedeVerConfiguracion"
          to="/admin/configuracion"
          active-class="bg-bomberos-red text-white font-semibold"
          class="sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">settings</span>
          Configuración
        </RouterLink>

        <!-- G) Auditoría -->
        <RouterLink
          v-if="puedeVerAuditoria"
          to="/admin/auditoria"
          active-class="bg-bomberos-red text-white font-semibold"
          class="sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">fact_check</span>
          Auditoría
        </RouterLink>
      </nav>
    </div>

    <!-- Widget Protocolo Vigente -->
    <div class="p-4 border-t border-white/10">
      <div class="rounded-lg bg-white/5 p-4">
        <div class="flex items-center gap-2 text-xs font-semibold text-white/90">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot"></span>
          Protocolo Vigente
        </div>
        <p class="mt-1 text-xs text-white/60">R.M. 123/2024 — SIPPCI v2.1</p>
        <p class="mt-2 text-[11px] text-white/40">Última actualización: 16/09/2026</p>
      </div>
    </div>
  </aside>
</template>
