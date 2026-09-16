import { computed } from 'vue'
import { useRouter } from 'vue-router'

export function usePermisos() {
  const router = useRouter()

  const user = computed(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const rol = computed(() => {
    const stored = localStorage.getItem('userRole')
    if (stored) return stored
    if (user.value?.role) return user.value.role
    return null
  })

  // ─── Roles internos ───
  const esAdmin = computed(() => rol.value === 'ADMIN')
  const esOficial = computed(() => rol.value === 'OFICIAL')
  const esCapacitor = computed(() => rol.value === 'CAPACITOR')

  // ─── Acceso al panel admin ───
  const puedeAccederAdmin = computed(() =>
    esAdmin.value || esOficial.value || esCapacitor.value
  )

  // ─── Panel Principal ───
  const puedeVerPanelPrincipal = computed(() =>
    esAdmin.value || esOficial.value || esCapacitor.value
  )
  const puedeAccionarPanelPrincipal = computed(() =>
    esAdmin.value || esOficial.value
  )

  // ─── Solicitudes (ADMIN, OFICIAL) ───
  const puedeVerSolicitudes = computed(() => esAdmin.value || esOficial.value)
  const puedeGestionarSolicitudes = computed(() => esAdmin.value || esOficial.value)

  // ─── Reportes (ADMIN, OFICIAL) ───
  const puedeVerReportes = computed(() => esAdmin.value || esOficial.value)

  // ─── Capacitaciones (ADMIN, CAPACITOR) ───
  const puedeVerCapacitaciones = computed(() => esAdmin.value || esCapacitor.value)
  const puedeGestionarCapacitaciones = computed(() => esAdmin.value || esCapacitor.value)

  // ─── Solo ADMIN ───
  const puedeVerUsuarios = computed(() => esAdmin.value)
  const puedeVerConfiguracion = computed(() => esAdmin.value)
  const puedeVerAuditoria = computed(() => esAdmin.value)

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    router.push('/login')
  }

  return {
    user,
    rol,
    esAdmin,
    esOficial,
    esCapacitor,
    puedeAccederAdmin,
    puedeVerPanelPrincipal,
    puedeAccionarPanelPrincipal,
    puedeVerSolicitudes,
    puedeVerReportes,
    puedeVerCapacitaciones,
    puedeVerUsuarios,
    puedeVerConfiguracion,
    puedeVerAuditoria,
    puedeGestionarSolicitudes,
    puedeGestionarCapacitaciones,
    logout,
  }
}
