import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

// @Global() evita tener que importar PrismaModule en cada módulo de
// dominio (Users, Habits, etc.) — con importarlo una vez en AppModule basta.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
