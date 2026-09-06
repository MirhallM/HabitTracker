// Cálculo de rachas — funciones puras, sin acceso a base de datos.
// Se usan tanto para la racha por hábito como para los días activos de la cuenta.

const MS_PER_DAY = 86_400_000; // 24 * 60 * 60 * 1000

export type Frequency = 'daily' | 'weekly' | 'custom';

// Convierte una fecha al número de día desde una referencia fija.
// Dos fechas del mismo día dan el mismo número; días seguidos difieren en 1.
export function dayIndex(value: Date | string): number {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return Math.round(d.getTime() / MS_PER_DAY);
}

// Convierte una fecha al índice del PERÍODO al que pertenece, según la
// frecuencia del hábito. Este es el corazón del diseño: el algoritmo de
// racha nunca cambia, solo cambia cómo se agrupan las fechas.
export function periodIndex(
  value: Date | string,
  frequency: Frequency,
  options: { intervalDays?: number | null; startDate?: Date | string } = {},
): number {
  const day = dayIndex(value);

  if (frequency === 'weekly') {
    // Semanas ancladas a lunes. El +3 corrige que el día 0 de la
    // referencia (1 de enero de 1970) cayó en jueves.
    return Math.floor((day + 3) / 7);
  }

  if (frequency === 'custom') {
    // Ventanas de N días contadas desde que arrancó el hábito.
    const interval = options.intervalDays ?? 1;
    const start = options.startDate ? dayIndex(options.startDate) : 0;
    return Math.floor((day - start) / interval);
  }

  return day; // daily
}

// Dada la lista de períodos en los que hubo cumplimiento, calcula la racha.
export function computeStreak(periods: number[], currentPeriod: number) {
  // Períodos únicos, del más reciente al más antiguo
  const unique = [...new Set(periods)].sort((a, b) => b - a);

  if (unique.length === 0) {
    return { currentStreak: 0, bestStreak: 0, completedInCurrentPeriod: false };
  }

  // Mejor racha histórica: recorre todo buscando la cadena más larga
  let bestStreak = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    run = unique[i - 1] - unique[i] === 1 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
  }

  const completedInCurrentPeriod = unique[0] === currentPeriod;

  // Día de gracia: la racha sigue viva si el último cumplimiento fue en el
  // período actual O en el inmediatamente anterior.
  const streakIsAlive =
    unique[0] === currentPeriod || unique[0] === currentPeriod - 1;

  let currentStreak = 0;
  if (streakIsAlive) {
    currentStreak = 1;
    for (let i = 1; i < unique.length; i++) {
      if (unique[i - 1] - unique[i] === 1) currentStreak++;
      else break;
    }
  }

  return { currentStreak, bestStreak, completedInCurrentPeriod };
}

// Convierte un índice de día de vuelta a Date (medianoche local).
// Usa setDate en vez de aritmética con milisegundos para que los
// cambios de horario y los saltos de mes se manejen correctamente.
function dateFromDayIndex(index: number): Date {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + (index - dayIndex(base)));
  return base;
}

// Devuelve [start, end) del período al que pertenece la fecha, usando
// exactamente el mismo anclaje que periodIndex.
export function periodRange(
  value: Date | string,
  frequency: Frequency,
  options: { intervalDays?: number | null; startDate?: Date | string } = {},
): { start: Date; end: Date } {
  const day = dayIndex(value);
  let startDay: number;
  let length: number;

  if (frequency === 'weekly') {
    // Inverso de floor((day + 3) / 7): la semana W empieza en 7W - 3
    startDay = Math.floor((day + 3) / 7) * 7 - 3;
    length = 7;
  } else if (frequency === 'custom') {
    const interval = options.intervalDays ?? 1;
    const anchor = options.startDate ? dayIndex(options.startDate) : 0;
    startDay = anchor + Math.floor((day - anchor) / interval) * interval;
    length = interval;
  } else {
    startDay = day;
    length = 1;
  }

  return {
    start: dateFromDayIndex(startDay),
    end: dateFromDayIndex(startDay + length),
  };
}
