import { Injectable } from '@nestjs/common';
import { HabitFrequency } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { HabitsService } from '../habits/habits.service.js';
import {
  computeStreak,
  dayIndex,
  periodIndex,
  periodRange,
  type Frequency,
} from '../common/streaks.js';

// Ventana que cubre el desglose por hábito y las gráficas mensuales.
const WINDOW_DAYS = 30;

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

// Primer día de la ventana de 30 días que termina hoy.
function windowStart() {
  const from = startOfDay(new Date());
  from.setDate(from.getDate() - (WINDOW_DAYS - 1));
  return from;
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
    return this.completionsFrom(userId, windowStart(), WINDOW_DAYS);
  }

  // Rendimiento de cada hábito ACTIVO en los últimos 30 días, contado en
  // PERÍODOS y no en días: un semanal cumplido 3 de 4 semanas es 75%, aunque
  // solo tenga 3 registros en el mes. Por eso esto no se puede derivar de
  // /monthly, que agrega entre todos los diarios sin separar por hábito.
  async byHabit(userId: string) {
    const [habits, records] = await Promise.all([
      // Ya trae la racha calculada; no la recalculamos aquí.
      this.habitsService.findAllForUser(userId),
      this.prisma.habitRecord.findMany({
        where: { userId, completed: true },
        select: { habitId: true, date: true },
      }),
    ]);

    const datesByHabit = new Map<string, Date[]>();
    for (const record of records) {
      const list = datesByHabit.get(record.habitId) ?? [];
      list.push(record.date);
      datesByHabit.set(record.habitId, list);
    }

    const from = windowStart();
    const today = startOfDay(new Date());

    return habits
      .filter((habit) => habit.archivedAt === null)
      .map((habit) => {
        const frequency = habit.frequency as Frequency;
        const options = {
          intervalDays: habit.intervalDays,
          startDate: habit.startDate,
        };

        const donePeriods = new Set(
          (datesByHabit.get(habit.id) ?? []).map((date) =>
            periodIndex(date, frequency, options),
          ),
        );

        let expected = 0;
        let completed = 0;
        const seen = new Set<number>();

        // Recorremos los días de la ventana y nos quedamos con un día por
        // período. Es más simple —y usa las mismas funciones— que invertir
        // periodIndex para reconstruir el rango de cada período.
        for (let i = 0; i < WINDOW_DAYS; i++) {
          const day = new Date(from);
          day.setDate(day.getDate() + i);

          const period = periodIndex(day, frequency, options);
          if (seen.has(period)) continue;
          seen.add(period);

          const { end } = periodRange(day, frequency, options);
          const lastDay = new Date(end);
          lastDay.setDate(lastDay.getDate() - 1);

          // El período en curso todavía no venció: contarlo como incumplido
          // castigaría una semana que apenas va por el martes.
          if (lastDay > today) continue;

          // Mismo criterio que las gráficas: el hábito tenía que existir,
          // no haber terminado y no estar archivado cuando el período venció.
          if (!countsOnDay(habit, lastDay)) continue;

          expected++;
          if (donePeriods.has(period)) completed++;
        }

        return {
          habitId: habit.id,
          name: habit.name,
          category: habit.category,
          frequency: habit.frequency,
          priority: habit.priority,
          completed,
          expected,
          // 0 cuando no venció nada: la UI lo muestra como "sin datos",
          // no como un 0% de cumplimiento.
          rate: expected === 0 ? 0 : Math.round((completed / expected) * 100),
          currentStreak: habit.streak.currentStreak,
          bestStreak: habit.streak.bestStreak,
        };
      });
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
