// Filtrado de hábitos: funciones puras, sin React ni acceso a la red.
// Todo ocurre en el cliente sobre los hábitos que GET /habits ya devolvió,
// así que no hace falta ni un endpoint nuevo ni debounce.
import { daysUntilPeriodEnd } from "@/lib/dates";
import { comparePriority } from "@/lib/habit-meta";
import type { Habit } from "@/types/habit";

export type QuickFilter = "all" | "completed" | "pending" | "urgent";

// Filtros avanzados: cada lista vacía significa "sin restricción". Dentro de
// un grupo los valores se suman (OR); entre grupos se acumulan (AND).
export type AdvancedFilters = {
  priorities: string[];
  frequencies: string[];
  categories: string[];
};

export const EMPTY_FILTERS: AdvancedFilters = {
  priorities: [],
  frequencies: [],
  categories: [],
};

// Marcador para los hábitos sin categoría, que también deben poder filtrarse.
export const NO_CATEGORY = "__sin-categoria__";

export type SortKey =
  | "recent"
  | "name-asc"
  | "name-desc"
  | "priority"
  | "streak"
  | "due";

// Minúsculas y sin acentos, para que "habito" encuentre "Hábito".
// NFD separa cada letra de su tilde, y el rango del replace (U+0300–U+036F,
// las marcas diacríticas combinables) las borra. Son caracteres invisibles
// en el editor: si esta línea se ve vacía entre los corchetes, está bien.
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Busca en nombre, descripción y categoría — no solo en el nombre.
export function matchesSearch(habit: Habit, query: string) {
  const needle = normalize(query);
  if (!needle) return true;

  return [habit.name, habit.description, habit.category].some(
    (field) => field && normalize(field).includes(needle),
  );
}

// Urgente = todavía no cumplido y su período se cierra hoy o mañana.
// Es el mismo criterio con el que el dashboard resalta los vencimientos,
// en vez de inventar una definición distinta para esta pantalla.
export function isUrgent(habit: Habit) {
  if (habit.streak.completedInCurrentPeriod) return false;
  return daysUntilPeriodEnd(habit) <= 1;
}

export function matchesQuickFilter(habit: Habit, filter: QuickFilter) {
  if (filter === "completed") return habit.streak.completedInCurrentPeriod;
  if (filter === "pending") return !habit.streak.completedInCurrentPeriod;
  if (filter === "urgent") return isUrgent(habit);
  return true; // "all"
}

export function matchesAdvancedFilters(
  habit: Habit,
  filters: AdvancedFilters,
) {
  const { priorities, frequencies, categories } = filters;

  if (priorities.length > 0 && !priorities.includes(habit.priority)) {
    return false;
  }
  if (frequencies.length > 0 && !frequencies.includes(habit.frequency)) {
    return false;
  }
  if (categories.length > 0) {
    if (!categories.includes(habit.category ?? NO_CATEGORY)) return false;
  }
  return true;
}

export function countActiveFilters(filters: AdvancedFilters) {
  return (
    filters.priorities.length +
    filters.frequencies.length +
    filters.categories.length
  );
}

// Las categorías son texto libre, así que la lista se deriva de los hábitos
// que ya tenemos en pantalla en vez de hardcodearse.
export function collectCategories(habits: Habit[]) {
  const found = new Set<string>();
  let hasUncategorized = false;

  for (const habit of habits) {
    if (habit.category) found.add(habit.category);
    else hasUncategorized = true;
  }

  const sorted = [...found].sort((a, b) => a.localeCompare(b, "es"));
  return { categories: sorted, hasUncategorized };
}

// Ordena sin mutar el arreglo original. Cada criterio cae de vuelta al
// nombre para que el resultado sea estable ante empates.
export function sortHabits(habits: Habit[], key: SortKey, isArchived: boolean) {
  const byName = (a: Habit, b: Habit) => a.name.localeCompare(b.name, "es");

  return [...habits].sort((a, b) => {
    switch (key) {
      case "name-asc":
        return byName(a, b);
      case "name-desc":
        return byName(b, a);
      case "priority":
        return comparePriority(a.priority, b.priority) || byName(a, b);
      case "streak": {
        // En archivados la racha actual siempre acaba en cero, así que el
        // criterio con sentido es la mejor racha alcanzada.
        const value = (h: Habit) =>
          isArchived ? h.streak.bestStreak : h.streak.currentStreak;
        return value(b) - value(a) || byName(a, b);
      }
      case "due":
        return daysUntilPeriodEnd(a) - daysUntilPeriodEnd(b) || byName(a, b);
      case "recent":
      default:
        // El backend ya devuelve createdAt desc; lo replicamos explícitamente
        // para que ordenar no dependa del orden en que llegó la respuesta.
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}
