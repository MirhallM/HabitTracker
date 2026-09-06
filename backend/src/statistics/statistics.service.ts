import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { computeStreak, dayIndex } from '../common/streaks.js';

const MS_PER_DAY = 86_400_000;

function startOfDay(value: string | Date) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
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
  constructor(private readonly prisma: PrismaService) {}

  async summary(userId: string) {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today.getTime() + MS_PER_DAY);

    const [totalHabits, activeHabits, completedToday, activityDates] =
      await Promise.all([
        this.prisma.habit.count({ where: { userId } }),
        this.prisma.habit.count({ where: { userId, active: true } }),
        this.prisma.habitRecord.count({
          where: {
            userId,
            completed: true,
            date: { gte: today, lt: tomorrow },
          },
        }),
        this.prisma.habitRecord.findMany({
          where: { userId, completed: true },
          select: { date: true },
        }),
      ]);

    // Racha de cuenta: días consecutivos en los que se completó ALGO.
    // Siempre diaria, sin importar la frecuencia de cada hábito.
    const activityStreak = computeStreak(
      activityDates.map((r) => dayIndex(r.date)),
      dayIndex(new Date()),
    );

    // % de cumplimiento de hoy sobre los hábitos activos
    const completionRate =
      activeHabits === 0
        ? 0
        : Math.round((completedToday / activeHabits) * 100);

    return {
      totalHabits,
      activeHabits,
      finishedHabits: totalHabits - activeHabits,
      completedToday,
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

  // Cuántos hábitos se completaron cada día, desde `from`, por `days` días.
  // Devuelve TODOS los días del rango, incluidos los que tienen 0, para que
  // el frontend pueda graficar directo sin rellenar huecos.
  private async completionsFrom(userId: string, from: Date, days: number) {
    const records = await this.prisma.habitRecord.findMany({
      where: { userId, completed: true, date: { gte: from } },
      select: { date: true },
    });

    const counts = new Map<string, number>();
    for (const record of records) {
      const key = dayKey(record.date);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const result: { date: string; completed: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      const key = dayKey(d);
      result.push({ date: key, completed: counts.get(key) ?? 0 });
    }
    return result;
  }
}
