/**
 * Catálogo de permisos del sistema SIPPCI
 * Estructura jerárquica: { recurso: { accion: boolean } }
 */
export const PERMISOS = {
  // Solicitudes
  SOLICITUDES_READ: 'solicitudes.read',
  SOLICITUDES_CREATE: 'solicitudes.create',
  SOLICITUDES_UPDATE: 'solicitudes.update',
  SOLICITUDES_DELETE: 'solicitudes.delete',
  SOLICITUDES_CHANGE_ESTADO: 'solicitudes.changeEstado',
  SOLICITUDES_ASSIGN_INSPECTOR: 'solicitudes.assignInspector',
  SOLICITUDES_VALIDATE_REQUISITOS: 'solicitudes.validateRequisitos',
  SOLICITUDES_VIEW_REQUISITOS: 'solicitudes.viewRequisitos',

  // Documentos
  DOCUMENTOS_READ: 'documentos.read',
  DOCUMENTOS_UPLOAD: 'documentos.upload',
  DOCUMENTOS_DOWNLOAD: 'documentos.download',
  DOCUMENTOS_DELETE: 'documentos.delete',

  // Certificados
  CERTIFICADOS_READ: 'certificados.read',
  CERTIFICADOS_EMIT: 'certificados.emit',
  CERTIFICADOS_REVOKE: 'certificados.revoke',

  // Usuarios
  USUARIOS_READ: 'usuarios.read',
  USUARIOS_CREATE: 'usuarios.create',
  USUARIOS_UPDATE: 'usuarios.update',
  USUARIOS_DELETE: 'usuarios.delete',
  USUARIOS_MANAGE_PERMISOS: 'usuarios.managePermisos',

  // Alertas
  ALERTAS_READ: 'alertas.read',
  ALERTAS_MARK_READ: 'alertas.markRead',

  // Estadísticas
  STATS_READ: 'stats.read',

  // Configuración
  CONFIG_READ: 'config.read',
  CONFIG_UPDATE: 'config.update',
} as const;

export type PermisoKey = keyof typeof PERMISOS;
export type Permiso = (typeof PERMISOS)[PermisoKey];

/**
 * Permisos por rol (default)
 * Estos se seedean en BD y pueden ser modificados por un admin
 */
export const PERMISOS_POR_ROL: Record<string, Permiso[]> = {
  ADMIN: [
    // Todos los permisos
    ...Object.values(PERMISOS),
  ],
  INSPECTOR: [
    PERMISOS.SOLICITUDES_READ,
    PERMISOS.SOLICITUDES_UPDATE,
    PERMISOS.SOLICITUDES_CHANGE_ESTADO,
    PERMISOS.SOLICITUDES_ASSIGN_INSPECTOR,
    PERMISOS.SOLICITUDES_VALIDATE_REQUISITOS,
    PERMISOS.SOLICITUDES_VIEW_REQUISITOS,
    PERMISOS.DOCUMENTOS_READ,
    PERMISOS.DOCUMENTOS_DOWNLOAD,
    PERMISOS.CERTIFICADOS_READ,
    PERMISOS.ALERTAS_READ,
    PERMISOS.STATS_READ,
  ],
  CAJERO: [
    PERMISOS.SOLICITUDES_READ,
    PERMISOS.SOLICITUDES_UPDATE,
    PERMISOS.SOLICITUDES_VIEW_REQUISITOS,
    PERMISOS.DOCUMENTOS_READ,
    PERMISOS.CERTIFICADOS_READ,
    PERMISOS.STATS_READ,
  ],
  SUPERVISOR: [
    PERMISOS.SOLICITUDES_READ,
    PERMISOS.SOLICITUDES_UPDATE,
    PERMISOS.SOLICITUDES_CHANGE_ESTADO,
    PERMISOS.SOLICITUDES_VALIDATE_REQUISITOS,
    PERMISOS.SOLICITUDES_VIEW_REQUISITOS,
    PERMISOS.DOCUMENTOS_READ,
    PERMISOS.DOCUMENTOS_DOWNLOAD,
    PERMISOS.CERTIFICADOS_READ,
    PERMISOS.CERTIFICADOS_EMIT,
    PERMISOS.USUARIOS_READ,
    PERMISOS.ALERTAS_READ,
    PERMISOS.ALERTAS_MARK_READ,
    PERMISOS.STATS_READ,
    PERMISOS.CONFIG_READ,
  ],
  TECNICO_VERIFICADOR: [
    PERMISOS.SOLICITUDES_READ,
    PERMISOS.SOLICITUDES_VIEW_REQUISITOS,
    PERMISOS.DOCUMENTOS_READ,
    PERMISOS.DOCUMENTOS_DOWNLOAD,
    PERMISOS.CERTIFICADOS_READ,
    PERMISOS.STATS_READ,
  ],
};