"use client";

import { useEffect, useMemo, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import AddRounded from "@mui/icons-material/AddRounded";
import ChecklistRounded from "@mui/icons-material/ChecklistRounded";
import Inventory2Rounded from "@mui/icons-material/Inventory2Rounded";
import SearchOffRounded from "@mui/icons-material/SearchOffRounded";
import FilterAltOffRounded from "@mui/icons-material/FilterAltOffRounded";
import CelebrationRounded from "@mui/icons-material/CelebrationRounded";
import Link from "@/components/Link";
import EmptyState from "@/components/EmptyState";
import HabitCard from "@/components/HabitCard";
import HabitsToolbar from "@/components/habits/HabitsToolbar";
import {
  collectCategories,
  countActiveFilters,
  EMPTY_FILTERS,
  matchesAdvancedFilters,
  matchesQuickFilter,
  matchesSearch,
  sortHabits,
  type AdvancedFilters,
  type QuickFilter,
  type SortKey,
} from "@/lib/habit-filters";
import {
  getHabits,
  deleteHabit,
  markHabit,
  setHabitArchived,
} from "@/services/habit.service";
import { ApiError } from "@/lib/api";
import type { Habit } from "@/types/habit";

type TabValue = "active" | "archived";

// Un aviso puede traer una acción para revertirlo: archivar y restaurar son
// reversibles, así que se deshacen desde el propio Snackbar en vez de pedir
// confirmación por adelantado. Eliminar, que no lo es, sigue con su diálogo.
type Toast = { message: string; onUndo?: () => void };

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tab, setTab] = useState<TabValue>("active");

  // La búsqueda y los filtros se conservan al cambiar de pestaña: si buscas
  // "lectura" en activos y pasas a archivados, sigues buscando lo mismo.
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [filters, setFilters] = useState<AdvancedFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("recent");

  // Cambiar este número vuelve a disparar el efecto de carga.
  // Es la forma de "recargar" sin llamar al fetch desde fuera del efecto.
  const [reloadKey, setReloadKey] = useState(0);

  // Hábito pendiente de confirmación de borrado (null = diálogo cerrado)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Id del hábito cuya acción está en proceso, para deshabilitar solo su fila
  const [busyId, setBusyId] = useState<string | null>(null);

  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getHabits();
        if (cancelled) return;
        setHabits(data);
        setLoadError(null);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "No se pudieron cargar tus hábitos",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    // Si el componente se desmonta antes de que responda el backend,
    // evitamos actualizar estado de algo que ya no existe.
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function handleToggle(habit: Habit, completed: boolean) {
    setBusyId(habit.id);
    try {
      await markHabit(habit.id, new Date(), completed);
      setToast({
        message: completed
          ? "Hábito marcado como cumplido"
          : "Marca eliminada",
      });
      // Recarga para traer la racha recalculada por el backend
      setReloadKey((k) => k + 1);
    } catch (error) {
      setToast({
        message:
          error instanceof ApiError ? error.message : "No se pudo actualizar",
      });
    } finally {
      setBusyId(null);
    }
  }

  // withUndo evita que el aviso de "deshacer" ofrezca a su vez deshacerse.
  async function applyArchive(habit: Habit, archived: boolean, withUndo = true) {
    setBusyId(habit.id);
    try {
      await setHabitArchived(habit.id, archived);
      setToast({
        message: archived
          ? `"${habit.name}" fue archivado`
          : `"${habit.name}" fue restaurado`,
        onUndo: withUndo
          ? () => void applyArchive(habit, !archived, false)
          : undefined,
      });
      setReloadKey((k) => k + 1);
    } catch (error) {
      setToast({
        message:
          error instanceof ApiError
            ? error.message
            : "No se pudo actualizar el hábito",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!habitToDelete) return;
    setIsDeleting(true);
    try {
      await deleteHabit(habitToDelete.id);
      setHabits((prev) => prev.filter((h) => h.id !== habitToDelete.id));
      setToast({ message: `"${habitToDelete.name}" fue eliminado` });
      setHabitToDelete(null);
    } catch (error) {
      setToast({
        message:
          error instanceof ApiError ? error.message : "No se pudo eliminar",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const activeHabits = habits.filter((h) => h.archivedAt === null);
  const archivedHabits = habits.filter((h) => h.archivedAt !== null);

  // Los hábitos de la pestaña actual, antes de filtrar. Sirve para distinguir
  // "esta pestaña está vacía" de "tus filtros no encontraron nada".
  const tabHabits = tab === "active" ? activeHabits : archivedHabits;

  // En archivados el filtro rápido no aplica, así que no se toma en cuenta.
  const appliesQuickFilter = tab === "active" && quickFilter !== "all";
  const hasSearch = search.trim() !== "";
  const advancedCount = countActiveFilters(filters);
  const hasFilters = hasSearch || appliesQuickFilter || advancedCount > 0;

  // Las categorías del selector salen de los hábitos reales del usuario.
  const { categories, hasUncategorized } = useMemo(
    () => collectCategories(habits),
    [habits],
  );

  const visibleHabits = useMemo(() => {
    const filtered = tabHabits.filter(
      (habit) =>
        matchesSearch(habit, search) &&
        matchesAdvancedFilters(habit, filters) &&
        (!appliesQuickFilter || matchesQuickFilter(habit, quickFilter)),
    );
    return sortHabits(filtered, sort, tab === "archived");
  }, [tabHabits, search, filters, appliesQuickFilter, quickFilter, sort, tab]);

  const hasAnyHabit = habits.length > 0;
  const isReady = !isLoading && !loadError;

  // Cuenta todo lo que altera la lista, para el resumen "N encontrados".
  const activeFilterCount =
    advancedCount + (hasSearch ? 1 : 0) + (appliesQuickFilter ? 1 : 0);

  function clearFilters() {
    setSearch("");
    setQuickFilter("all");
    setFilters(EMPTY_FILTERS);
  }

  // El vacío depende de POR QUÉ no hay resultados: no es lo mismo no tener
  // hábitos que haber filtrado de más.
  function renderFilteredEmptyState() {
    // Con filtros avanzados puestos, los mensajes específicos mentirían:
    // puede que sí tengas urgentes y solo estén ocultos por la categoría.
    if (advancedCount > 0) {
      return (
        <EmptyState
          icon={FilterAltOffRounded}
          title="No hay hábitos con esos filtros"
          description="Prueba quitando alguno."
          action={<Button onClick={clearFilters}>Limpiar filtros</Button>}
          sx={{ py: 8 }}
        />
      );
    }

    if (hasSearch) {
      return (
        <EmptyState
          icon={SearchOffRounded}
          title="No encontramos hábitos"
          description="Prueba con otro término o revisa la ortografía."
          action={<Button onClick={clearFilters}>Limpiar búsqueda</Button>}
          sx={{ py: 8 }}
        />
      );
    }

    if (quickFilter === "urgent") {
      return (
        <EmptyState
          icon={CelebrationRounded}
          title="No tienes hábitos urgentes"
          description="Todo está bajo control."
          sx={{ py: 8 }}
        />
      );
    }

    if (quickFilter === "completed") {
      return (
        <EmptyState
          icon={FilterAltOffRounded}
          title="Todavía no completas ninguno"
          description="Marca un hábito y aparecerá aquí."
          sx={{ py: 8 }}
        />
      );
    }

    if (quickFilter === "pending") {
      return (
        <EmptyState
          icon={CelebrationRounded}
          title="No te queda nada por hacer"
          description="Completaste todos tus hábitos de este período."
          sx={{ py: 8 }}
        />
      );
    }

    return (
      <EmptyState
        icon={FilterAltOffRounded}
        title="No hay hábitos con esos filtros"
        description="Prueba quitando alguno."
        action={<Button onClick={clearFilters}>Limpiar filtros</Button>}
        sx={{ py: 8 }}
      />
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography variant="h2" component="h1" sx={{ fontSize: "1.75rem" }}>
          Mis hábitos
        </Typography>
        <Button
          component={Link}
          href="/habits/new"
          variant="contained"
          startIcon={<AddRounded />}
        >
          Nuevo hábito
        </Button>
      </Stack>

      {/* Las pestañas solo aparecen cuando hay algo que separar */}
      {isReady && hasAnyHabit && (
        <Tabs
          value={tab}
          onChange={(_, value: TabValue) => setTab(value)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab value="active" label={`Activos (${activeHabits.length})`} />
          <Tab
            value="archived"
            label={`Archivados (${archivedHabits.length})`}
          />
        </Tabs>
      )}

      {/* La toolbar solo tiene sentido si hay algo que buscar o filtrar */}
      {isReady && hasAnyHabit && (
        <HabitsToolbar
          search={search}
          onSearchChange={setSearch}
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
          showQuickFilters={tab === "active"}
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
          hasUncategorized={hasUncategorized}
          sort={sort}
          onSortChange={setSort}
          activeFilterCount={activeFilterCount}
          onClearFilters={clearFilters}
          resultCount={visibleHabits.length}
        />
      )}

      {/* Estado: cargando */}
      {isLoading && (
        <Stack spacing={2}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={116} />
          ))}
        </Stack>
      )}

      {/* Estado: error al cargar */}
      {!isLoading && loadError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setIsLoading(true);
                setReloadKey((k) => k + 1);
              }}
            >
              Reintentar
            </Button>
          }
        >
          {loadError}
        </Alert>
      )}

      {/* Estado: vacío — sin ningún hábito todavía */}
      {isReady && !hasAnyHabit && (
        <EmptyState
          icon={ChecklistRounded}
          title="Todavía no tienes hábitos"
          description="Crea tu primer hábito y empieza a construir tu racha."
          action={
            <Button
              component={Link}
              href="/habits/new"
              variant="contained"
              startIcon={<AddRounded />}
            >
              Crear mi primer hábito
            </Button>
          }
          sx={{ py: 8 }}
        />
      )}

      {/* Estado: vacío — hay hábitos, pero ninguno en esta pestaña */}
      {isReady && hasAnyHabit && tabHabits.length === 0 && (
        <EmptyState
          icon={tab === "active" ? ChecklistRounded : Inventory2Rounded}
          title={
            tab === "active"
              ? "No tienes hábitos activos"
              : "No tienes hábitos archivados"
          }
          description={
            tab === "active"
              ? "Restaura uno archivado o crea uno nuevo para empezar."
              : "Aquí guardarás los hábitos que dejes en pausa, sin perder su historial."
          }
          action={
            tab === "active" ? (
              <Button
                component={Link}
                href="/habits/new"
                variant="contained"
                startIcon={<AddRounded />}
              >
                Nuevo hábito
              </Button>
            ) : undefined
          }
          sx={{ py: 8 }}
        />
      )}

      {/* Estado: vacío — la pestaña tiene hábitos, pero los filtros los ocultan */}
      {isReady &&
        tabHabits.length > 0 &&
        visibleHabits.length === 0 &&
        hasFilters &&
        renderFilteredEmptyState()}

      {/* Estado: con datos */}
      {isReady && visibleHabits.length > 0 && (
        <Stack spacing={2}>
          {visibleHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onDelete={setHabitToDelete}
              onArchive={(h) => void applyArchive(h, true)}
              onRestore={(h) => void applyArchive(h, false)}
              isBusy={busyId === habit.id}
            />
          ))}
        </Stack>
      )}

      {/* Confirmación para acción destructiva */}
      <Dialog
        open={Boolean(habitToDelete)}
        onClose={() => !isDeleting && setHabitToDelete(null)}
      >
        <DialogTitle>¿Eliminar este hábito?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se eliminará <strong>{habitToDelete?.name}</strong> junto con todo
            su historial. Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHabitToDelete(null)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        message={toast?.message}
        // Más tiempo cuando hay algo que deshacer: hay que darle oportunidad
        // de reaccionar antes de que el aviso desaparezca.
        autoHideDuration={toast?.onUndo ? 6000 : 3000}
        onClose={() => setToast(null)}
        action={
          toast?.onUndo ? (
            <Button
              color="secondary"
              size="small"
              onClick={() => {
                toast.onUndo?.();
                setToast(null);
              }}
            >
              Deshacer
            </Button>
          ) : undefined
        }
      />
    </Stack>
  );
}
