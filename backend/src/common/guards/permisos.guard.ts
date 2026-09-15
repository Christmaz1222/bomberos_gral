import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermisosService } from '../services/permisos.service';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { Permiso } from '../constants/permisos';

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permisosService: PermisosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Obtener permisos requeridos del endpoint
    const permisosRequeridos = this.reflector.getAllAndOverride<Permiso[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay permisos requeridos, permitir (los roles se validan en RolesGuard)
    if (!permisosRequeridos || permisosRequeridos.length === 0) {
      return true;
    }

    // 2. Obtener usuario del request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // 3. Si es ciudadano (EXTERNO), no tiene permisos internos
    const rol = user.rol || user.role;
    if (rol === 'EXTERNO') {
      throw new ForbiddenException('Acceso denegado a panel administrativo');
    }

    // 4. Validar permisos
    const usuarioInternoId = user.sub || user.id;

    const tienePermisos = await this.permisosService.tieneTodosLosPermisos(
      usuarioInternoId,
      permisosRequeridos,
    );

    if (!tienePermisos) {
      throw new ForbiddenException(
        `Permisos insuficientes. Se requiere: ${permisosRequeridos.join(', ')}`,
      );
    }

    return true;
  }
}