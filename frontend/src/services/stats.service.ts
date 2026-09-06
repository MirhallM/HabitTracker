import { api } from "@/lib/api";

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

export function getSummary() {
  return api<StatsSummary>("/statistics/summary");
}

export function getWeekly() {
  return api<DailyCompletion[]>("/statistics/weekly");
}

export function getMonthly() {
  return api<DailyCompletion[]>("/statistics/monthly");
}
