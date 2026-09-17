import apiClient from '../config/api'

export const publicService = {
  /**
   * Consultar estado de solicitud por código (público)
   */
  async consultarSolicitud(codigo) {
    const { data } = await apiClient.get(`/public/solicitudes/${codigo}/estado`)
    return data
  },

  /**
   * Verificar certificado por QR (público)
   */
  async verificarCertificado(codigoQr) {
    const { data } = await apiClient.get(`/public/certificados/verificar/${codigoQr}`)
    return data
  },
}

export default publicService