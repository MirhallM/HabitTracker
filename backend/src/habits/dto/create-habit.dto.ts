import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { HabitFrequency, HabitPriority } from '@prisma/client';

export class CreateHabitDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(HabitFrequency)
  frequency?: HabitFrequency;

  // Solo se valida si la frecuencia es 'custom'; ahí sí es obligatorio.
  @ValidateIf((dto: CreateHabitDto) => dto.frequency === HabitFrequency.custom)
  @IsInt()
  @Min(2, {
    message: 'intervalDays debe ser 2 o más (para 1 día usa frequency: daily)',
  })
  intervalDays?: number;

  @IsOptional()
  @IsEnum(HabitPriority)
  priority?: HabitPriority;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
