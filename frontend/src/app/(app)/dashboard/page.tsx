"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import AddRounded from "@mui/icons-material/AddRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import ChecklistRounded from "@mui/icons-material/ChecklistRounded";
import Link from "@/components/Link";
import { useAuth } from "@/context/AuthContext";
import { getHabits, markHabit } from "@/services/habit.service";
import { getSummary, type StatsSummary } from "@/services/stats.service";
import { ApiError } from "@/lib/api";
import type { Habit } from "@/types/habit";

export default function DashboardPage() {
  const { user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Las dos peticiones en paralelo: no hay razón para esperar
        // una antes de lanzar la otra.
        const [habitsData, statsData] = await Promise.all([
          getHabits(),
          getSummary(),
        ]);
        if (cancelled) return;
        setHabits(habitsData);
        setStats(statsData);
        setLoadError(null);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "No se pudo cargar tu dashboard",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function handleToggle(habit: Habit, completed: boolean) {
    setBusyId(habit.id);
    try {
      await markHabit(habit.id, new Date(), completed);
      setToast(completed ? "¡Bien hecho!" : "Marca eliminada");
      setReloadKey((k) => k + 1);
    } catch (error) {
      setToast(
        error instanceof ApiError ? error.message : "No se pudo actualizar",
      );
    } finally {
      setBusyId(null);
    }
  }

  // Solo los hábitos activos aparecen en "Hábitos de hoy"
  const activeHabits = habits.filter((h) => h.active);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h2" component="h1" sx={{ fontSize: "1.75rem" }}>
          Hola, {user?.name?.split(" ")[0]}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Este es tu progreso de hoy.
        </Typography>
      </Stack>

      {isLoading && (
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={320} />
        </Stack>
      )}

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

      {!isLoading && !loadError && stats && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: "flex-start",
          }}
        >
          {/* Columna izquierda: métricas */}
          <Stack
            spacing={3}
            sx={{ width: { xs: "100%", md: 280 }, flexShrink: 0 }}
          >
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Progreso de hoy
                </Typography>
                <Typography
                  variant="h2"
                  component="p"
                  sx={{ fontSize: "2rem", my: 1 }}
                >
                  {stats.completedToday}
                  <Typography
                    variant="body1"
                    component="span"
                    color="text.secondary"
                  >
                    {" "}
                    / {stats.activeHabits} hábitos
                  </Typography>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(stats.completionRate, 100)}
                  color="success"
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {stats.completionRate}% completado
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Racha actual
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Stack spacing={0.5} sx={{ flex: 1, alignItems: "center" }}>
                    <LocalFireDepartmentRounded
                      sx={{
                        color: stats.completedSomethingToday
                          ? "success.main"
                          : "text.disabled",
                      }}
                    />
                    <Typography
                      variant="h2"
                      component="p"
                      sx={{ fontSize: "1.75rem" }}
                    >
                      {stats.activeDaysStreak}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      días
                    </Typography>
                  </Stack>

                  <Divider orientation="vertical" flexItem />

                  <Stack spacing={0.5} sx={{ flex: 1, alignItems: "center" }}>
                    <EmojiEventsRounded sx={{ color: "warning.main" }} />
                    <Typography
                      variant="h2"
                      component="p"
                      sx={{ fontSize: "1.75rem" }}
                    >
                      {stats.bestActiveDaysStreak}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      mejor
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          {/* Columna derecha: hábitos de hoy */}
          <Card sx={{ flex: 1, width: "100%" }}>
            <CardContent>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ fontSize: "1.125rem" }}
                >
                  Hábitos de hoy
                </Typography>
                <Button
                  component={Link}
                  href="/habits/new"
                  size="small"
                  startIcon={<AddRounded />}
                >
                  Hábito
                </Button>
              </Stack>

              {activeHabits.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 5 }}>
                  <ChecklistRounded
                    sx={{ fontSize: 44, color: "text.disabled", mb: 1.5 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    No tienes hábitos activos todavía.
                  </Typography>
                  <Button
                    component={Link}
                    href="/habits/new"
                    variant="contained"
                    size="small"
                    startIcon={<AddRounded />}
                  >
                    Crear mi primer hábito
                  </Button>
                </Box>
              ) : (
                <Stack divider={<Divider />}>
                  {activeHabits.map((habit) => (
                    <Stack
                      key={habit.id}
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", py: 1 }}
                    >
                      <Checkbox
                        checked={habit.streak.completedInCurrentPeriod}
                        onChange={(e) => handleToggle(habit, e.target.checked)}
                        disabled={busyId === habit.id}
                        color="success"
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          textDecoration: habit.streak.completedInCurrentPeriod
                            ? "line-through"
                            : "none",
                          color: habit.streak.completedInCurrentPeriod
                            ? "text.secondary"
                            : "text.primary",
                        }}
                      >
                        {habit.name}
                      </Typography>
                      {habit.streak.currentStreak > 0 && (
                        <Chip
                          size="small"
                          icon={<LocalFireDepartmentRounded />}
                          label={habit.streak.currentStreak}
                          color={
                            habit.streak.completedInCurrentPeriod
                              ? "success"
                              : "default"
                          }
                          variant={
                            habit.streak.completedInCurrentPeriod
                              ? "filled"
                              : "outlined"
                          }
                        />
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      <Snackbar
        open={Boolean(toast)}
        message={toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
      />
    </Stack>
  );
}
