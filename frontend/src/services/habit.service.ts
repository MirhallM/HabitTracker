import { api } from "@/lib/api";
import type { Habit, HabitRecord } from "@/types/habit";

export type HabitPayload = {
  name: string;
  description?: string;
  category?: string;
  frequency?: string;
  priority?: string;
  intervalDays?: number;
  startDate?: string;
  endDate?: string;
};

export function getHabits() {
  return api<Habit[]>("/habits");
}

export function getHabit(id: string) {
  return api<Habit>(`/habits/${id}`);
}

export function createHabit(payload: HabitPayload) {
  return api<Habit>("/habits", { method: "POST", body: payload });
}

export function updateHabit(id: string, payload: Partial<HabitPayload>) {
  return api<Habit>(`/habits/${id}`, { method: "PATCH", body: payload });
}

export function deleteHabit(id: string) {
  return api<{ deleted: boolean }>(`/habits/${id}`, { method: "DELETE" });
}

// Archivar (true) retira el hábito de la lista activa conservando todo su
// historial; restaurar (false) lo devuelve. Es reversible, a diferencia de
// deleteHabit, que sí destruye los registros.
export function setHabitArchived(id: string, archived: boolean) {
  return api<Habit>(`/habits/${id}/archive`, {
    method: "PATCH",
    body: { archived },
  });
}

// Marca (o desmarca) el hábito para una fecha. El backend hace upsert,
// así que llamarlo dos veces el mismo día actualiza en vez de duplicar.
export function markHabit(habitId: string, date: Date, completed: boolean) {
  return api<HabitRecord>(`/habits/${habitId}/records`, {
    method: "POST",
    body: { date: date.toISOString(), completed },
  });
}
