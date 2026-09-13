import type { HabitFrequency } from "@/types/habit";

const MS_PER_DAY = 86_400_000;

export function startOfDay(value: Date | string) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Lunes de la semana a la que pertenece la fecha.
// Coincide con cómo el backend agrupa los períodos semanales.
export function startOfWeek(value: Date | string) {
  const d = startOfDay(value);
  const weekday = d.getDay(); // 0 = domingo, 1 = lunes...
  // Si es domingo retrocedemos 6 días; si no, hasta el lunes anterior.
  d.setDate(d.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  return d;
}

export function endOfWeek(value: Date | string) {
  const d = startOfWeek(value);
  d.setDate(d.getDate() + 6);
  return d;
}

// Días restantes contando hoy: domingo = 1, lunes = 7.
export function daysLeftInWeek(value: Date | string) {
  const today = startOfDay(value);
  const end = endOfWeek(value);
  return Math.round((end.getTime() - today.getTime()) / MS_PER_DAY) + 1;
}

export function formatWeekRange(value: Date | string) {
  const start = startOfWeek(value);
  const end = endOfWeek(value);
  const sameMonth = start.getMonth() === end.getMonth();

  const startText = start.toLocaleDateString("es-HN", {
    day: "numeric",
    ...(sameMonth ? {} : { month: "short" }),
  });
  const endText = end.toLocaleDateString("es-HN", {
    day: "numeric",
    month: "short",
  });

  return `${startText} – ${endText}`;
}

export function daysLeftLabel(value: Date | string) {
  const days = daysLeftInWeek(value);
  if (days === 1) return "Vence hoy";
  if (days === 2) return "Vence mañana";
  return `Vencen en ${days} días`;
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatLongDate(value: Date | string) {
  const text = new Date(value).toLocaleDateString("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return capitalize(text);
}

// Las claves "YYYY-MM-DD" que devuelven /statistics/weekly y /monthly son días
// LOCALES. new Date("2026-09-12") las interpretaría como medianoche UTC, que en
// Honduras (UTC-6) cae el día anterior y correría todas las etiquetas un día.
export function parseDayKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// "12 sept" — compacto, para chips y etiquetas secundarias.
export function formatShortDate(value: Date | string) {
  return new Date(value).toLocaleDateString("es-HN", {
    day: "numeric",
    month: "short",
  });
}

// Evita el "1 días"
export function pluralizeDays(count: number) {
  return count === 1 ? "1 día" : `${count} días`;
}

// "1 de 1 completado" / "2 de 3 completados"
export function completedLabel(done: number, total: number) {
  return `${done} de ${total} completado${done === 1 ? "" : "s"}`;
}

export function dayIndexOf(value: Date | string) {
  return Math.round(startOfDay(value).getTime() / MS_PER_DAY);
}

// Último día de la ventana actual de un hábito "cada N días".
// Replica el anclaje que usa el backend: las ventanas se cuentan
// desde la fecha de inicio del hábito, no desde el calendario.
export function customPeriodEnd(startDate: string, intervalDays: number) {
  const today = dayIndexOf(new Date());
  const anchor = dayIndexOf(startDate);
  const windowStart =
    anchor + Math.floor((today - anchor) / intervalDays) * intervalDays;
  return windowStart + intervalDays - 1;
}

// Días que faltan para que se cierre el período actual del hábito.
// 0 = vence hoy. Unifica las tres frecuencias en un solo criterio para que
// filtrar y ordenar por vencimiento no reimplemente el cálculo.
export function daysUntilPeriodEnd(habit: {
  frequency: HabitFrequency;
  intervalDays: number | null;
  startDate: string;
}) {
  if (habit.frequency === "weekly") return daysLeftInWeek(new Date()) - 1;

  if (habit.frequency === "custom") {
    // Mismo respaldo que el backend: sin intervalo, la ventana es de 1 día.
    const interval = habit.intervalDays ?? 1;
    return customPeriodEnd(habit.startDate, interval) - dayIndexOf(new Date());
  }

  return 0; // daily: siempre vence hoy
}

// Etiqueta para hábitos personalizados: cuánto queda de su ventana actual.
export function customDueLabel(
  startDate: string,
  intervalDays: number | null,
  done: boolean,
) {
  if (!intervalDays) return null;

  const daysLeft = daysUntilPeriodEnd({
    frequency: "custom",
    intervalDays,
    startDate,
  });

  if (done) {
    // Ya cumplido: lo útil es cuándo vuelve a tocar
    const nextIn = daysLeft + 1;
    return nextIn === 1 ? "Vuelve mañana" : `Vuelve en ${nextIn} días`;
  }

  if (daysLeft === 0) return "Vence hoy";
  if (daysLeft === 1) return "Vence mañana";
  return `Vence en ${daysLeft} días`;
}
