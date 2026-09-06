import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  computeStreak,
  periodIndex,
  type Frequency,
} from '../common/streaks.js';
import type { CreateHabitDto } from './dto/create-habit.dto.js';
import type { UpdateHabitDto } from './dto/update-habit.dto.js';

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateHabitDto) {
    return this.prisma.habit.create({
      data: {
        ...dto,
        userId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  // Devuelve los hábitos con su racha ya calculada, en 2 consultas totales
  // (no una por hábito).
  async findAllForUser(userId: string) {
    const [habits, records] = await Promise.all([
      this.prisma.habit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.habitRecord.findMany({
        where: { userId, completed: true },
        select: { habitId: true, date: true },
      }),
    ]);

    // Agrupa los registros por hábito, en memoria
    const recordsByHabit = new Map<string, Date[]>();
    for (const record of records) {
      const list = recordsByHabit.get(record.habitId) ?? [];
      list.push(record.date);
      recordsByHabit.set(record.habitId, list);
    }

    return habits.map((habit) => ({
      ...habit,
      streak: this.buildStreak(habit, recordsByHabit.get(habit.id) ?? []),
    }));
  }

  async findOneForUser(userId: string, habitId: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
    });
    if (!habit) throw new NotFoundException('Hábito no encontrado');
    if (habit.userId !== userId) {
      throw new ForbiddenException('Este hábito no te pertenece');
    }
    return habit;
  }

  async findOneWithStreak(userId: string, habitId: string) {
    const habit = await this.findOneForUser(userId, habitId);

    const records = await this.prisma.habitRecord.findMany({
      where: { habitId, completed: true },
      select: { date: true },
    });

    return {
      ...habit,
      streak: this.buildStreak(
        habit,
        records.map((r) => r.date),
      ),
    };
  }

  async update(userId: string, habitId: string, dto: UpdateHabitDto) {
    await this.findOneForUser(userId, habitId);
    return this.prisma.habit.update({
      where: { id: habitId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  // Archivar es reversible y NO toca los registros: solo marca cuándo se
  // retiró el hábito. Restaurar (archived: false) limpia la marca y lo
  // devuelve a la lista activa con todo su historial intacto.
  async setArchived(userId: string, habitId: string, archived: boolean) {
    await this.findOneForUser(userId, habitId);
    return this.prisma.habit.update({
      where: { id: habitId },
      data: { archivedAt: archived ? new Date() : null },
    });
  }

  async remove(userId: string, habitId: string) {
    await this.findOneForUser(userId, habitId);

    // Los registros tienen una relación obligatoria con el hábito, así que
    // hay que borrarlos primero. $transaction garantiza que ambas operaciones
    // ocurran juntas: si una falla, ninguna se aplica.
    await this.prisma.$transaction([
      this.prisma.habitRecord.deleteMany({ where: { habitId } }),
      this.prisma.habit.delete({ where: { id: habitId } }),
    ]);

    return { deleted: true };
  }

  // Traduce las fechas de cumplimiento a períodos según la frecuencia
  // del hábito, y calcula la racha sobre esos períodos.
  private buildStreak(
    habit: {
      frequency: string;
      intervalDays: number | null;
      startDate: Date;
    },
    dates: Date[],
  ) {
    const options = {
      intervalDays: habit.intervalDays,
      startDate: habit.startDate,
    };
    const frequency = habit.frequency as Frequency;

    const periods = dates.map((date) => periodIndex(date, frequency, options));
    const currentPeriod = periodIndex(new Date(), frequency, options);

    return computeStreak(periods, currentPeriod);
  }
}
