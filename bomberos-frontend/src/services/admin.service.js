import apiClient from '../config/api'

/**
 * Servicio de administración — endpoints del panel admin
 * Todos los endpoints requieren JWT con rol INTERNO
 */
export const adminService = {
  /**
   * Obtiene los KPIs del dashboard
   */
  async obtenerStats() {
    const { data } = await apiClient.get('/admin/stats')
    return data
  },

  /**
   * Lista solicitudes paginadas con filtros
   * @param {Object} params - { page, limit, estado, modulo, q }
   */
  async listarSolicitudes(params = {}) {
    const { data } = await apiClient.get('/admin/solicitudes', { params })
    return data
  },

  /**
   * Detalle completo de una solicitud
   */
  async obtenerSolicitud(codigo) {
    const { data } = await apiClient.get(`/admin/solicitudes/${codigo}`)
    return data
  },

  /**
   * Alertas del sistema
   * @param {boolean} soloNoLeidas
   */
  async listarAlertas(soloNoLeidas = false) {
    const { data } = await apiClient.get('/admin/alertas', {
      params: soloNoLeidas ? { noLeidas: 'true' } : {},
    })
    return data
  },

  /**
   * Estado de guardia (mock)
   */
  async obtenerGuardia() {
    const { data } = await apiClient.get('/admin/guardia')
    return data
  },

  /**
   * Obtiene los estados permitidos para una solicitud según su estado actual y el rol
   */
  async obtenerEstadosPermitidos(codigo) {
    const { data } = await apiClient.get(`/admin/solicitudes/${codigo}/estados-permitidos`)
    return data
  },

  /**
   * Cambia el estado de una solicitud
   */
  async cambiarEstado(codigo, payload) {
    const { data } = await apiClient.patch(`/admin/solicitudes/${codigo}/estado`, payload)
    return data
  },

  /**
   * Marca una alerta como leída
   */
  async marcarAlertaLeida(alertaId) {
    const { data } = await apiClient.patch(`/admin/alertas/${alertaId}/leida`)
    return data
  },

  /**
   * Marca todas las alertas como leídas
   */
  async marcarTodasAlertasLeidas() {
    const { data } = await apiClient.patch('/admin/alertas/leer-todas')
    return data
  },

  /**
   * Descarga un documento (admin) — retorna el blob
   */
  async descargarDocumento(codigo, documentoId) {
    const response = await apiClient.get(
      `/admin/solicitudes/${codigo}/documentos/${documentoId}/descargar`,
      { responseType: 'blob' },
    )
    return response
  },

  /**
   * FASE 2: Lista los requisitos de una solicitud con estado y progreso
   */
  async listarRequisitos(codigo) {
    const { data } = await apiClient.get(`/admin/solicitudes/${codigo}/requisitos`)
    return data
  },

  /**
   * FASE 2: Actualiza el estado de un requisito (CUMPLIDO, OBSERVADO, PENDIENTE)
   */
  async actualizarRequisito(codigo, requisitoId, payload) {
    const { data } = await apiClient.patch(
      `/admin/solicitudes/${codigo}/requisitos/${requisitoId}`,
      payload,
    )
    return data
  },

  /**
   * FASE 4: Descarga el comprobante de registro (admin)
   */
  async descargarComprobante(codigo) {
    const response = await apiClient.get(
      `/admin/solicitudes/${codigo}/comprobante`,
      { responseType: 'blob' },
    )
    return response
  },

  // ============================================
  // FASE 7: INSPECCIONES
  // ============================================

  /**
   * Lista las inspecciones (filtros por estado/inspector)
   */
  async listarInspecciones(params = {}) {
    const { data } = await apiClient.get('/admin/inspecciones', { params })
    return data
  },

  /**
   * Detalle de una inspección
   */
  async detalleInspeccion(id) {
    const { data } = await apiClient.get(`/admin/inspecciones/${id}`)
    return data
  },

  /**
   * Completa una inspección (resultado + observaciones)
   */
  async completarInspeccion(id, payload) {
    const { data } = await apiClient.patch(`/admin/inspecciones/${id}/completar`, payload)
    return data
  },

  /**
   * Asigna un inspector a una solicitud
   */
  async asignarInspector(codigo, payload) {
    const { data } = await apiClient.post(`/admin/solicitudes/${codigo}/asignar-inspector`, payload)
    return data
  },

  /**
   * Lista usuarios internos (filtro por rol, p.ej. INSPECTOR)
   */
  async listarUsuariosInternos(rol) {
    const { data } = await apiClient.get('/admin/usuarios-internos', {
      params: rol ? { rol } : {},
    })
    return data
  },
}

export default adminService