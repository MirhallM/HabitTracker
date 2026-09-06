import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { HabitsService } from '../habits/habits.service.js';
import { periodRange, type Frequency } from '../common/streaks.js';
import type { CreateRecordDto } from './dto/create-record.dto.js';

// Normaliza a medianoche para que el índice único [habitId, date]
// impida dos registros del mismo día.
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
    // Valida que el hábito exista y sea de este usuario
    const habit = await this.habitsService.findOneForUser(userId, habitId);

    const date = startOfDay(dto.date);
    const completed = dto.completed ?? true;

    if (!completed) {
      // Desmarcar significa "no está cumplido en ESTE período", no
      // "no lo cumplí hoy". Un hábito semanal marcado el jueves seguiría
      // contando como hecho si solo borráramos el registro de hoy.
      const { start, end } = periodRange(date, habit.frequency as Frequency, {
        intervalDays: habit.intervalDays,
        startDate: habit.startDate,
      });

      const { count } = await this.prisma.habitRecord.deleteMany({
        where: { habitId, date: { gte: start, lt: end } },
      });

      return { cleared: count };
    }

    // Upsert: si ya existe un registro ese día, lo actualiza en vez de duplicar
    return this.prisma.habitRecord.upsert({
      where: { habitId_date: { habitId, date } },
      update: { completed: true },
      create: { habitId, userId, date, completed: true },
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
