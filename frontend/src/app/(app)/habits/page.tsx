"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import AddRounded from "@mui/icons-material/AddRounded";
import ChecklistRounded from "@mui/icons-material/ChecklistRounded";
import Link from "@/components/Link";
import HabitCard from "@/components/HabitCard";
import { getHabits, deleteHabit, markHabit } from "@/services/habit.service";
import { ApiError } from "@/lib/api";
import type { Habit } from "@/types/habit";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Cambiar este número vuelve a disparar el efecto de carga.
  // Es la forma de "recargar" sin llamar al fetch desde fuera del efecto.
  const [reloadKey, setReloadKey] = useState(0);

  // Hábito pendiente de confirmación de borrado (null = diálogo cerrado)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Id del hábito cuyo checkbox está en proceso, para deshabilitarlo
  const [busyId, setBusyId] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);

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
      setToast(completed ? "Hábito marcado como cumplido" : "Marca eliminada");
      // Recarga para traer la racha recalculada por el backend
      setReloadKey((k) => k + 1);
    } catch (error) {
      setToast(
        error instanceof ApiError ? error.message : "No se pudo actualizar",
      );
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
      setToast(`"${habitToDelete.name}" fue eliminado`);
      setHabitToDelete(null);
    } catch (error) {
      setToast(
        error instanceof ApiError ? error.message : "No se pudo eliminar",
      );
    } finally {
      setIsDeleting(false);
    }
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

      {/* Estado: vacío */}
      {!isLoading && !loadError && habits.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ChecklistRounded
            sx={{ fontSize: 56, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h3" component="p" sx={{ fontSize: "1.25rem" }}>
            Todavía no tienes hábitos
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, mb: 3 }}
          >
            Crea tu primer hábito y empieza a construir tu racha.
          </Typography>
          <Button
            component={Link}
            href="/habits/new"
            variant="contained"
            startIcon={<AddRounded />}
          >
            Crear mi primer hábito
          </Button>
        </Box>
      )}

      {/* Estado: con datos */}
      {!isLoading && !loadError && habits.length > 0 && (
        <Stack spacing={2}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onDelete={setHabitToDelete}
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
        message={toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
      />
    </Stack>
  );
}
