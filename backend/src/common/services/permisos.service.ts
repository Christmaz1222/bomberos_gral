import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Permiso, PERMISOS_POR_ROL } from '../constants/permisos';

interface CacheEntry {
  permisos: Permiso[];
  expiresAt: number;
}

@Injectable()
export class PermisosService {
  private readonly logger = new Logger(PermisosService.name);
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private cache = new Map<number, CacheEntry>(); // usuarioInternoId → permisos

  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene los permisos efectivos de un usuario interno
   * 1. Consulta BD (con caché)
   * 2. Si no tiene permisos custom, usa los del rol
   * 3. Retorna la lista plana de permisos
   */
  async obtenerPermisos(usuarioInternoId: number): Promise<Permiso[]> {
    // 1. Verificar caché
    const cached = this.cache.get(usuarioInternoId);
    if (cached && cached.expiresAt > Date.now()) {
      this.logger.verbose(`📦 Caché OK usuario ${usuarioInternoId}: ${cached.permisos.length} permisos`);
      return cached.permisos;
    }

    // 2. Consultar BD
    this.logger.verbose(`🧩 Consulta BD permisos usuario ${usuarioInternoId}`);
    const usuario = await this.prisma.usuarioInterno.findUnique({
      where: { id: usuarioInternoId },
      select: { id: true, rol: true, permisos: true, activo: true },
    });

    if (!usuario || !usuario.activo) {
      return [];
    }

    // 3. Determinar permisos
    let permisos: Permiso[] = [];

    // Si el usuario tiene permisos custom (JSON no vacío), usarlos
    if (
      usuario.permisos &&
      typeof usuario.permisos === 'object' &&
      Object.keys(usuario.permisos as object).length > 0
    ) {
      // Los permisos custom pueden ser:
      // - Un array de strings: ["solicitudes.read", "solicitudes.create"]
      // - Un objeto jerárquico: { solicitudes: { read: true, create: true } }
      permisos = this.parsearPermisosCustom(usuario.permisos);
    } else {
      // Fallback: permisos default del rol
      permisos = PERMISOS_POR_ROL[usuario.rol] || [];
    }

    // 4. Guardar en caché
    this.cache.set(usuarioInternoId, {
      permisos,
      expiresAt: Date.now() + this.CACHE_TTL,
    });

    this.logger.log(`📦 Permisos usuario ${usuarioInternoId} (${usuario.rol}): ${permisos.length} → ${permisos.join(', ')}`);

    return permisos;
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async tienePermiso(usuarioInternoId: number, permiso: Permiso): Promise<boolean> {
    const permisos = await this.obtenerPermisos(usuarioInternoId);
    return permisos.includes(permiso);
  }

  /**
   * Verifica si un usuario tiene TODOS los permisos especificados
   */
  async tieneTodosLosPermisos(
    usuarioInternoId: number,
    permisosRequeridos: Permiso[],
  ): Promise<boolean> {
    const permisos = await this.obtenerPermisos(usuarioInternoId);
    return permisosRequeridos.every((p) => permisos.includes(p));
  }

  /**
   * Invalida el caché de un usuario (al cambiar permisos)
   */
  invalidarCache(usuarioInternoId: number): void {
    this.cache.delete(usuarioInternoId);
    this.logger.log(`🗑️ Caché de permisos invalidado: usuario ${usuarioInternoId}`);
  }

  /**
   * Invalida todo el caché (al cambiar permisos de rol)
   */
  invalidarTodoElCache(): void {
    this.cache.clear();
    this.logger.log('🗑️ Caché de permisos completamente invalidado');
  }

  /**
   * Parsea permisos custom (JSON) a array de strings
   */
  private parsearPermisosCustom(permisosJson: any): Permiso[] {
    // Si es un array, retornarlo directamente
    if (Array.isArray(permisosJson)) {
      return permisosJson as Permiso[];
    }

    // Si es un objeto jerárquico, aplanarlo
    if (typeof permisosJson === 'object') {
      const permisos: Permiso[] = [];

      for (const [recurso, acciones] of Object.entries(permisosJson)) {
        if (typeof acciones === 'object' && acciones !== null) {
          for (const [accion, valor] of Object.entries(acciones)) {
            if (valor === true) {
              permisos.push(`${recurso}.${accion}` as Permiso);
            }
          }
        }
      }

      return permisos;
    }

    return [];
  }
}