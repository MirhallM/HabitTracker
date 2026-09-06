// Espejo de backend/prisma/schema.prisma — mantener sincronizados.
export type HabitFrequency = "daily" | "weekly" | "custom";
export type HabitPriority = "low" | "medium" | "high";

export type Streak = {
  currentStreak: number;
  bestStreak: number;
  completedInCurrentPeriod: boolean;
};

export type Habit = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string | null;
  frequency: HabitFrequency;
  priority: HabitPriority;
  intervalDays: number | null;
  startDate: string;
  endDate: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  streak: Streak;
};

export type HabitRecord = {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
};
