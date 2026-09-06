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
import AddRounded from "@mui/icons-material/AddRounded";
import ChecklistRounded from "@mui/icons-material/ChecklistRounded";
import Link from "@/components/Link";
import TodayProgressCard from "@/components/dashboard/TodayProgressCard";
import StreakCard from "@/components/dashboard/StreakCard";
import HabitGroupCard from "@/components/dashboard/HabitGroupCard";
import WeekSummaryCard from "@/components/dashboard/WeekSummaryCard";
import { useAuth } from "@/context/AuthContext";
import { getHabits, markHabit } from "@/services/habit.service";
import {
  getSummary,
  getWeekly,
  type StatsSummary,
  type DailyCompletion,
} from "@/services/stats.service";
import { formatLongDate, formatWeekRange, daysLeftLabel } from "@/lib/dates";
import { ApiError } from "@/lib/api";
import type { Habit } from "@/types/habit";

// Menor número = mayor prioridad al ordenar
const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

// Pendientes primero; dentro de cada bloque, por prioridad.
function sortHabits(list: Habit[]) {
  return [...list].sort((a, b) => {
    const aDone = a.streak.completedInCurrentPeriod ? 1 : 0;
    const bDone = b.streak.completedInCurrentPeriod ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [week, setWeek] = useState<DailyCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Las tres en paralelo: ninguna depende de las otras.
        const [habitsData, statsData, weekData] = await Promise.all([
          getHabits(),
          getSummary(),
          getWeekly(),
        ]);
        if (cancelled) return;
        setHabits(habitsData);
        setStats(statsData);
        setWeek(weekData);
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

  const activeHabits = habits.filter((h) => h.active);
  const dailyHabitCount = activeHabits.filter(
    (h) => h.frequency === "daily",
  ).length;
  const now = new Date();

  // Los semanales comparten la misma ventana (lunes a domingo), por eso
  // llevan subtítulo. Los personalizados tienen ventanas distintas cada uno.
  const groups = [
    { key: "daily", title: "Diarios", subtitle: null as string | null },
    {
      key: "weekly",
      title: "Semanales",
      subtitle: `${formatWeekRange(now)} · ${daysLeftLabel(now)}`,
    },
    { key: "custom", title: "Personalizados", subtitle: null as string | null },
  ]
    .map((group) => ({
      ...group,
      habits: sortHabits(activeHabits.filter((h) => h.frequency === group.key)),
    }))
    .filter((group) => group.habits.length > 0);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h2" component="h1" sx={{ fontSize: "1.75rem" }}>
          Hola, {user?.name?.split(" ")[0]}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Este es tu progreso de hoy.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatLongDate(now)}
        </Typography>
      </Stack>

      {isLoading && (
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={150} />
          <Skeleton variant="rounded" height={260} />
          <Skeleton variant="rounded" height={130} />
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
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ maxWidth: 720 }}
          >
            <TodayProgressCard
              completed={stats.completedToday}
              total={stats.activeHabits}
              percent={stats.completionRate}
            />
            <StreakCard
              current={stats.activeDaysStreak}
              best={stats.bestActiveDaysStreak}
              activeToday={stats.completedSomethingToday}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: "center" }}
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
              variant="contained"
              startIcon={<AddRounded />}
            >
              Nuevo hábito
            </Button>
          </Stack>

          {groups.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
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
                  startIcon={<AddRounded />}
                >
                  Crear mi primer hábito
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(auto-fit, minmax(260px, 1fr))",
                },
                gap: 3,
                alignItems: "start",
              }}
            >
              {groups.map((group) => (
                <HabitGroupCard
                  key={group.key}
                  title={group.title}
                  subtitle={group.subtitle}
                  habits={group.habits}
                  onToggle={handleToggle}
                  busyId={busyId}
                />
              ))}
            </Box>
          )}

          {week.length > 0 && (
            <WeekSummaryCard days={week} dailyHabitCount={dailyHabitCount} />
          )}
        </>
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
