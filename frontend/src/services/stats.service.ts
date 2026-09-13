import { api } from "@/lib/api";
import type { HabitFrequency, HabitPriority } from "@/types/habit";

export type StatsSummary = {
  totalHabits: number;
  activeHabits: number;
  archivedHabits: number;
  dueToday: number;
  completedDueToday: number;
  completionRate: number;
  activeDaysStreak: number;
  bestActiveDaysStreak: number;
  completedSomethingToday: boolean;
};

export type DailyCompletion = {
  date: string;
  completed: number;
  expected: number;
};

// Rendimiento de un hábito activo en los últimos 30 días, contado en
// PERÍODOS: para un semanal, 3 de 4 semanas es 75%.
export type HabitPerformance = {
  habitId: string;
  name: string;
  category: string | null;
  frequency: HabitFrequency;
  priority: HabitPriority;
  completed: number;
  // 0 cuando todavía no venció ningún período: eso es "sin datos",
  // no un 0% de cumplimiento.
  expected: number;
  rate: number;
  currentStreak: number;
  bestStreak: number;
};

export function getSummary() {
  return api<StatsSummary>("/statistics/summary");
}

export function getWeekly() {
  return api<DailyCompletion[]>("/statistics/weekly");
}

export function getMonthly() {
  return api<DailyCompletion[]>("/statistics/monthly");
}

export function getByHabit() {
  return api<HabitPerformance[]>("/statistics/by-habit");
}
