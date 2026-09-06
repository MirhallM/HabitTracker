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
  if (days === 1) return "Último día";
  return `Quedan ${days} días`;
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

// Evita el "1 días"
export function pluralizeDays(count: number) {
  return count === 1 ? "1 día" : `${count} días`;
}
