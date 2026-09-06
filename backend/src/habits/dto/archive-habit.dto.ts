import { IsBoolean } from 'class-validator';

// DTO propio en vez de @Body('archived'): al extraer un primitivo por clave,
// el ValidationPipe global omite la validación y aceptaría cualquier valor.
export class ArchiveHabitDto {
  @IsBoolean()
  archived: boolean;
}
