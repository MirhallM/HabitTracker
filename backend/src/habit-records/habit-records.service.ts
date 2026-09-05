import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { HabitsService } from '../habits/habits.service.js';
import type { CreateRecordDto } from './dto/create-record.dto.js';

// Normaliza cualquier fecha a medianoche, para que el índice único
// [habitId, date] impida dos registros del mismo día.
function startOfDay(value: string | Date) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

@Injectable()
export class HabitRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly habitsService: HabitsService,
  ) {}

  async create(userId: string, habitId: string, dto: CreateRecordDto) {
    // Valida que el hábito exista Y que sea de este usuario.
    // Reutilizamos la lógica de HabitsService en vez de duplicarla.
    await this.habitsService.findOneForUser(userId, habitId);

    const date = startOfDay(dto.date);
    const completed = dto.completed ?? true;

    return this.prisma.habitRecord.upsert({
      where: { habitId_date: { habitId, date } },
      update: { completed },
      create: { habitId, userId, date, completed },
    });
  }

  async findAllForHabit(userId: string, habitId: string) {
    await this.habitsService.findOneForUser(userId, habitId);

    return this.prisma.habitRecord.findMany({
      where: { habitId },
      orderBy: { date: 'desc' },
    });
  }
}
