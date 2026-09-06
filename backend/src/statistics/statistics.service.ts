import { Injectable } from '@nestjs/common';
import { HabitFrequency } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { HabitsService } from '../habits/habits.service.js';
import {
  computeStreak,
  dayIndex,
  periodRange,
  type Frequency,
} from '../common/streaks.js';

function startOfDay(value: string | Date) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ¿Este hábito correspondía en ese día? Ya había iniciado, todavía no había
// terminado, y aún no estaba archivado.
//
// Archivar NO reescribe el pasado: como guardamos la fecha de archivado y no
// un booleano, los días anteriores siguen contando exactamente igual y el
// hábito solo deja de contar desde el día en que se archivó en adelante.
function countsOnDay(
  habit: { startDate: Date; endDate: Date | null; archivedAt: Date | null },
  dayStart: Date,
) {
  if (startOfDay(habit.startDate) > dayStart) return false;
  if (habit.endDate && startOfDay(habit.endDate) < dayStart) return false;
  if (habit.archivedAt && startOfDay(habit.archivedAt) <= dayStart) return false;
  return true;
}

// Clave legible "YYYY-MM-DD" en hora local, para las gráficas.
function dayKey(date: Date) {
  const d = startOfDay(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Injectable()
export class StatisticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly habitsService: HabitsService,
  ) {}

  async summary(userId: string) {
    const [habits, activityDates] = await Promise.all([
      this.habitsService.findAllForUser(userId),
      this.prisma.habitRecord.findMany({
        where: { userId, completed: true },
        select: { date: true },
      }),
    ]);

    const active = habits.filter((h) => h.archivedAt === null);
    const today = startOfDay(new Date());

    // Un hábito "vence hoy" si hoy es el último día de su período actual.
    // Los diarios siempre; los semanales solo el domingo; los personalizados
    // solo al cerrar su ventana. Así un semanal recién iniciado el lunes
    // no aparece como pendiente toda la semana.
    const dueToday = active.filter((habit) => {
      const { end } = periodRange(today, habit.frequency as Frequency, {
        intervalDays: habit.intervalDays,
        startDate: habit.startDate,
      });
      const lastDay = new Date(end);
      lastDay.setDate(lastDay.getDate() - 1);
      return lastDay.getTime() === today.getTime();
    });

    const completedDueToday = dueToday.filter(
      (h) => h.streak.completedInCurrentPeriod,
    ).length;

    // Racha de cuenta: días consecutivos en los que se completó ALGO.
    const activityStreak = computeStreak(
      activityDates.map((r) => dayIndex(r.date)),
      dayIndex(new Date()),
    );

    const completionRate =
      dueToday.length === 0
        ? 0
        : Math.round((completedDueToday / dueToday.length) * 100);

    return {
      totalHabits: habits.length,
      activeHabits: active.length,
      archivedHabits: habits.length - active.length,
      dueToday: dueToday.length,
      completedDueToday,
      completionRate,
      activeDaysStreak: activityStreak.currentStreak,
      bestActiveDaysStreak: activityStreak.bestStreak,
      completedSomethingToday: activityStreak.completedInCurrentPeriod,
    };
  }

  // Semana calendario actual (lunes a domingo), consistente con cómo
  // periodIndex agrupa los hábitos semanales en streaks.ts
  weekly(userId: string) {
    const from = startOfDay(new Date());
    const weekday = from.getDay(); // 0 = domingo
    from.setDate(from.getDate() + (weekday === 0 ? -6 : 1 - weekday));
    return this.completionsFrom(userId, from, 7);
  }

  monthly(userId: string) {
    const from = startOfDay(new Date());
    from.setDate(from.getDate() - 29);
    return this.completionsFrom(userId, from, 30);
  }

  // Por cada día devuelve cuántos hábitos se cumplieron y cuántos
  // correspondían. Solo se consideran los hábitos DIARIOS: un semanal
  // o personalizado no pertenece a un día concreto, así que incluirlos
  // distorsionaría el cálculo de "día completo".
  private async completionsFrom(userId: string, from: Date, days: number) {
    const [records, dailyHabits] = await Promise.all([
      this.prisma.habitRecord.findMany({
        where: { userId, completed: true, date: { gte: from } },
        select: { date: true, habitId: true },
      }),
      this.prisma.habit.findMany({
        where: { userId, frequency: HabitFrequency.daily },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          archivedAt: true,
        },
      }),
    ]);

    const dailyById = new Map(dailyHabits.map((h) => [h.id, h]));

    // Los cumplimientos se filtran con el mismo criterio que los esperados,
    // para que nunca haya un "3 de 2" en el resumen semanal.
    const counts = new Map<string, number>();
    for (const record of records) {
      const habit = dailyById.get(record.habitId);
      if (!habit) continue;
      if (!countsOnDay(habit, startOfDay(record.date))) continue;
      const key = dayKey(record.date);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const result: { date: string; completed: number; expected: number }[] = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      const dayStart = startOfDay(d);
      const key = dayKey(d);

      const expected = dailyHabits.filter((habit) =>
        countsOnDay(habit, dayStart),
      ).length;

      result.push({ date: key, completed: counts.get(key) ?? 0, expected });
    }

    return result;
  }
}
