// Fuente única de las etiquetas, colores y orden de prioridad y frecuencia.
// Antes vivían duplicadas en HabitCard, HabitGroupCard, HabitForm y el
// dashboard; cada pantalla nueva creaba otra copia que se desincronizaba.
import type { HabitFrequency, HabitPriority } from "@/types/habit";

type PriorityMeta = {
  // "Alta" — para chips, donde el contexto ya se entiende
  label: string;
  // "Prioridad alta" — para tooltips y lectores de pantalla
  longLabel: string;
  // Color de Chip de MUI
  chipColor: "default" | "warning" | "error";
  // Token de la paleta, para el punto de color del dashboard
  dotColor: string;
  // Menor número = mayor prioridad al ordenar
  order: number;
};

const PRIORITY_META: Record<HabitPriority, PriorityMeta> = {
  high: {
    label: "Alta",
    longLabel: "Prioridad alta",
    chipColor: "error",
    dotColor: "error.main",
    order: 0,
  },
  medium: {
    label: "Media",
    longLabel: "Prioridad media",
    chipColor: "warning",
    dotColor: "warning.main",
    order: 1,
  },
  low: {
    label: "Baja",
    longLabel: "Prioridad baja",
    chipColor: "default",
    dotColor: "text.disabled",
    order: 2,
  },
};

// Acceso con respaldo: si llegara una prioridad desconocida desde el backend,
// la tratamos como media en vez de romper el render.
export function priorityMeta(priority: string): PriorityMeta {
  return PRIORITY_META[priority as HabitPriority] ?? PRIORITY_META.medium;
}

export function comparePriority(a: string, b: string) {
  return priorityMeta(a).order - priorityMeta(b).order;
}

type FrequencyMeta = {
  // "Personalizado" — etiqueta corta para chips
  label: string;
  // "Personalizados" — para títulos de grupo
  pluralLabel: string;
  // "Cada cierto número de días" — texto explicativo para el formulario
  formLabel: string;
};

const FREQUENCY_META: Record<HabitFrequency, FrequencyMeta> = {
  daily: { label: "Diario", pluralLabel: "Diarios", formLabel: "Diario" },
  weekly: { label: "Semanal", pluralLabel: "Semanales", formLabel: "Semanal" },
  custom: {
    label: "Personalizado",
    pluralLabel: "Personalizados",
    formLabel: "Cada cierto número de días",
  },
};

// Orden en que se presentan las frecuencias, de la más exigente a la menos.
export const FREQUENCY_ORDER: HabitFrequency[] = ["daily", "weekly", "custom"];

export function frequencyMeta(frequency: string): FrequencyMeta {
  return FREQUENCY_META[frequency as HabitFrequency] ?? FREQUENCY_META.daily;
}

// Etiqueta de frecuencia de un hábito concreto: los personalizados muestran
// su intervalo real ("Cada 3 días") en vez de la palabra genérica.
export function frequencyLabel(habit: {
  frequency: string;
  intervalDays: number | null;
}) {
  if (habit.frequency === "custom" && habit.intervalDays) {
    return `Cada ${habit.intervalDays} días`;
  }
  return FREQUENCY_META[habit.frequency as HabitFrequency]?.label ?? habit.frequency;
}

// Opciones para los <TextField select> del formulario, en el orden en que
// deben aparecer (de menor a mayor exigencia).
export const FREQUENCY_OPTIONS = (
  Object.keys(FREQUENCY_META) as HabitFrequency[]
).map((value) => ({ value, label: FREQUENCY_META[value].formLabel }));

export const PRIORITY_OPTIONS = (["low", "medium", "high"] as HabitPriority[]).map(
  (value) => ({ value, label: PRIORITY_META[value].label }),
);
