import { Global, Module } from '@nestjs/common';
import { PermisosService } from './services/permisos.service';

@Global()
@Module({
  providers: [PermisosService],
  exports: [PermisosService],
})
export class CommonModule {}