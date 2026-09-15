<template>
  <div class="min-h-screen bg-gray-50">
    <AdminSidebar @logout="handleLogout" />
    <AdminHeader
      :notificaciones-count="notificacionesCount"
      :refrescando="refrescando"
      @notificaciones="irANotificaciones"
      @refrescar="refrescarTodo"
    />

    <main class="pl-72 pt-16 min-h-screen bg-gray-50">
      <div class="p-6">
        <RouterView :key="refreshKey" />
      </div>
    </main>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminHeader from '../components/admin/AdminHeader.vue'
import ToastContainer from '../components/ToastContainer.vue'

const router = useRouter()
const notificacionesCount = ref(0)
const refrescando = ref(false)
const refreshKey = ref(0)

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('userRole')
  localStorage.removeItem('tipoUsuario')
  router.push('/admin/login')
}

function irANotificaciones() {
  router.push('/admin/alertas')
}

function refrescarTodo() {
  refreshKey.value += 1
  refrescando.value = true
  setTimeout(() => {
    refrescando.value = false
  }, 1000)
}

onMounted(() => {
  const tipo = localStorage.getItem('tipoUsuario')
  if (tipo !== 'INTERNO') {
    router.push('/admin/login')
  }
})
</script>