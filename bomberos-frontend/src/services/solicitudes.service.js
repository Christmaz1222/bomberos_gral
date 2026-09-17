import apiClient from '../config/api'

/**
 * Servicio de solicitudes para el ciudadano
 */
export const solicitudesService = {
  /**
   * Descarga el comprobante de registro (ciudadano)
   */
  async descargarComprobante(codigo) {
    const response = await apiClient.get(
      `/solicitudes/${codigo}/comprobante`,
      { responseType: 'blob' },
    )
    return response
  },

  /**
   * Obtiene una solicitud por código
   */
  async obtenerPorCodigo(codigo) {
    const { data } = await apiClient.get(`/solicitudes/${codigo}`)
    return data
  },

  /**
   * Lista las solicitudes del usuario autenticado
   */
  async misSolicitudes(params = {}) {
    const { data } = await apiClient.get('/solicitudes/mias', { params })
    return data
  },
}

export default solicitudesService
