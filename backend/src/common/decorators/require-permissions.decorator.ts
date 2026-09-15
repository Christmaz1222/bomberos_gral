import { SetMetadata } from '@nestjs/common';
import { Permiso } from '../constants/permisos';

export const PERMISSIONS_KEY = 'requiredPermissions';

/**
 * Decorador para especificar los permisos requeridos en un endpoint
 * @param permisos - Lista de permisos. El usuario debe tener TODOS.
 */
export const RequirePermissions = (...permisos: Permiso[]) =>
  SetMetadata(PERMISSIONS_KEY, permisos);