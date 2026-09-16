<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardMockService } from '../../../services/dashboard.mock.service.js'

import SectionTitle from '../../../components/admin/SectionTitle.vue'
import StatCard from '../../../components/admin/StatCard.vue'

const router = useRouter()

const cargando = ref(true)
const metricas = ref(null)

const irA = (ruta) => {
  router.push(ruta)
}

// TODO: reemplazar por dashboardService real cuando backend esté listo
onMounted(async () => {
  try {
    metricas.value = await dashboardMockService.getMetricasSippci()
  } catch (error) {
    console.error('Error al cargar métricas SIPPCI:', error)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="space-y-8">
    <!-- 1. Título de sección con Breadcrumb -->
    <SectionTitle
      :breadcrumb="['Admin', 'Solicitudes', 'SIPPCI']"
      titulo="SIPPCI — Inspección de Infraestructuras"
      subtitulo="Gestión y revisión técnica de planes de evacuación, sistemas fijos contra incendios, señalización reglamentaria y extintores."
    />

    <!-- 2. Grid de 3 Cards de Acceso Rápido -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1: Registro de Profesionales -->
      <div
        @click="irA('/admin/solicitudes/sippci/profesionales')"
        class="bg-bomberos-navy text-white rounded-2xl p-6 min-h-[160px] flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md hover:scale-[1.01] transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">badge</span>
          </div>
          <span class="material-symbols-outlined text-[22px] text-white/60 group-hover:translate-x-1 group-hover:text-white transition-all">
            arrow_forward
          </span>
        </div>
        <div>
          <h2 class="font-headline-sm text-headline-sm font-bold">Registro de Profesionales</h2>
          <p class="font-body-sm text-body-sm text-white/70 mt-1">12 pendientes</p>
        </div>
      </div>

      <!-- Card 2: Capacitación -->
      <div
        @click="irA('/admin/capacitaciones')"
        class="bg-bomberos-red text-white rounded-2xl p-6 min-h-[160px] flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md hover:scale-[1.01] transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">menu_book</span>
          </div>
          <span class="material-symbols-outlined text-[22px] text-white/60 group-hover:translate-x-1 group-hover:text-white transition-all">
            arrow_forward
          </span>
        </div>
        <div>
          <h2 class="font-headline-sm text-headline-sm font-bold">Capacitación</h2>
          <p class="font-body-sm text-body-sm text-white/70 mt-1">4 cursos activos</p>
        </div>
      </div>

      <!-- Card 3: Cumplimiento al SIPPCI -->
      <div
        @click="irA('/admin/solicitudes/sippci/cumplimiento/certificacion')"
        class="bg-bomberos-red text-white rounded-2xl p-6 min-h-[160px] flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md hover:scale-[1.01] transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">verified_user</span>
          </div>
          <span class="material-symbols-outlined text-[22px] text-white/60 group-hover:translate-x-1 group-hover:text-white transition-all">
            arrow_forward
          </span>
        </div>
        <div>
          <h2 class="font-headline-sm text-headline-sm font-bold">Cumplimiento al SIPPCI</h2>
          <p class="font-body-sm text-body-sm text-white/70 mt-1">16 observadas</p>
        </div>
      </div>
    </div>

    <!-- 3. Grid de 4 StatCards -->
    <div>
      <!-- Skeleton mientras carga -->
      <div v-if="cargando" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        <div v-for="i in 4" :key="i" class="h-32 bg-white rounded-xl shadow-sm p-4"></div>
      </div>

      <!-- StatCards con datos -->
      <div v-else-if="metricas" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          titulo="Solicitudes Pendientes"
          :valor="metricas.pendientes"
          subtitulo="+5 hoy"
          icono="pending_actions"
          colorIcono="text-amber-600"
          colorFondoIcono="bg-amber-50"
        />

        <StatCard
          titulo="En Revisión"
          :valor="metricas.enRevision"
          subtitulo="Mesa colegiada"
          icono="rate_review"
          colorIcono="text-blue-600"
          colorFondoIcono="bg-blue-50"
        />

        <StatCard
          titulo="Aprobadas"
          :valor="metricas.aprobadas"
          subtitulo="Certificados"
          icono="task_alt"
          colorIcono="text-emerald-600"
          colorFondoIcono="bg-emerald-50"
        />

        <StatCard
          titulo="Observadas"
          :valor="metricas.observadas"
          subtitulo="Riesgo Alto"
          icono="warning"
          colorIcono="text-bomberos-red"
          colorFondoIcono="bg-red-50"
          colorValor="text-bomberos-red"
          colorSubtitulo="text-bomberos-red"
        />
      </div>
    </div>
  </div>
</template>
