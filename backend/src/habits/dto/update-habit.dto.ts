import { PartialType } from '@nestjs/mapped-types';
import { CreateHabitDto } from './create-habit.dto.js';

// Archivar no pasa por aquí: tiene su propio endpoint y DTO, para que
// "editar un hábito" y "retirarlo de la lista" no se mezclen.
export class UpdateHabitDto extends PartialType(CreateHabitDto) {}
