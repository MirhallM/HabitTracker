"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddRounded from "@mui/icons-material/AddRounded";
import ChecklistRounded from "@mui/icons-material/ChecklistRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import Link from "@/components/Link";
import EmptyState from "@/components/EmptyState";
import StatTile from "@/components/statistics/StatTile";
import MonthlyCompletionChart from "@/components/statistics/MonthlyCompletionChart";
import FrequencyBreakdownCard from "@/components/statistics/FrequencyBreakdownCard";
import HabitBreakdownCard from "@/components/statistics/HabitBreakdownCard";
import {
  getByHabit,
  getMonthly,
  getSummary,
  type DailyCompletion,
  type HabitPerformance,
  type StatsSummary,
} from "@/services/stats.service";
import { pluralizeDays } from "@/lib/dates";
import { ApiError } from "@/lib/api";

export default function StatisticsPage() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [monthly, setMonthly] = useState<DailyCompletion[]>([]);
  const [performance, setPerformance] = useState<HabitPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Las tres en paralelo: ninguna depende de las otras.
        const [summaryData, monthlyData, performanceData] = await Promise.all([
          getSummary(),
          getMonthly(),
          getByHabit(),
        ]);
        if (cancelled) return;
        setSummary(summaryData);
        setMonthly(monthlyData);
        setPerformance(performanceData);
        setLoadError(null);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "No se pudieron cargar tus estadísticas",
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

  // Promedio de los últimos 30 días, sobre los días que sí tenían algo
  // que cumplir. Los días vacíos no cuentan como 0%.
  const counted = monthly.filter((day) => day.expected > 0);
  const totalExpected = counted.reduce((sum, day) => sum + day.expected, 0);
  const totalCompleted = counted.reduce((sum, day) => sum + day.completed, 0);
  const monthlyAverage =
    totalExpected === 0
      ? null
      : Math.round((totalCompleted / totalExpected) * 100);

  const isReady = !isLoading && !loadError && summary !== null;
  const hasHabits = (summary?.totalHabits ?? 0) > 0;

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h2" component="h1" sx={{ fontSize: "1.75rem" }}>
          Estadísticas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tu progreso a lo largo del tiempo.
        </Typography>
      </Stack>

      {isLoading && (
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={340} />
          <Skeleton variant="rounded" height={220} />
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

      {isReady && !hasHabits && (
        <EmptyState
          icon={InsightsRounded}
          title="Todavía no hay nada que medir"
          description="Crea tu primer hábito y aquí verás cómo evoluciona tu cumplimiento."
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

      {isReady && hasHabits && (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ alignItems: "stretch" }}
          >
            <StatTile
              icon={ChecklistRounded}
              label="Hábitos activos"
              value={String(summary.activeHabits)}
              caption={
                summary.archivedHabits > 0
                  ? `de ${summary.totalHabits} creados · ${summary.archivedHabits} archivados`
                  : `de ${summary.totalHabits} creados`
              }
            />
            <StatTile
              icon={LocalFireDepartmentRounded}
              iconColor={
                summary.completedSomethingToday
                  ? "success.main"
                  : "text.disabled"
              }
              label="Racha de días activos"
              value={pluralizeDays(summary.activeDaysStreak)}
              caption={`Tu mejor marca: ${pluralizeDays(
                summary.bestActiveDaysStreak,
              )}`}
            />
            <StatTile
              icon={TrendingUpRounded}
              iconColor="secondary.main"
              label="Cumplimiento (30 días)"
              value={monthlyAverage === null ? "—" : `${monthlyAverage}%`}
              caption="Solo hábitos diarios"
            />
          </Stack>

          <MonthlyCompletionChart days={monthly} />

          <FrequencyBreakdownCard performance={performance} />

          <HabitBreakdownCard performance={performance} />
        </>
      )}
    </Stack>
  );
}
