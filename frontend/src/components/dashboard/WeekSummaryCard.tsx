"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { formatWeekRange, startOfDay } from "@/lib/dates";
import type { DailyCompletion } from "@/services/stats.service";

// El backend devuelve la semana de lunes a domingo
const WEEKDAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

type DayStatus = "full" | "partial" | "empty" | "future";

type Props = {
  days: DailyCompletion[];
  // Hábitos diarios activos: la única referencia fiable de "cuántos
  // tocaban" un día cualquiera. Los semanales no tienen día fijo.
  dailyHabitCount: number;
};

export default function WeekSummaryCard({ days, dailyHabitCount }: Props) {
  const todayKey = startOfDay(new Date()).toISOString().slice(0, 10);

  function statusFor(day: DailyCompletion): DayStatus {
    // Un día que todavía no llega no es un fracaso
    if (day.date > todayKey) return "future";
    if (day.completed === 0) return "empty";
    if (dailyHabitCount === 0) return "full";
    return day.completed >= dailyHabitCount ? "full" : "partial";
  }

  const statuses = days.map(statusFor);
  const elapsed = statuses.filter((s) => s !== "future").length;
  const fullDays = statuses.filter((s) => s === "full").length;

  const styleFor: Record<DayStatus, object> = {
    full: { bgcolor: "success.main", borderColor: "success.main" },
    partial: { bgcolor: "success.light", borderColor: "success.main" },
    empty: { bgcolor: "transparent", borderColor: "divider" },
    future: { bgcolor: "transparent", borderColor: "divider", opacity: 0.4 },
  };

  const labelFor: Record<DayStatus, string> = {
    full: "Día completo",
    partial: "Parcialmente cumplido",
    empty: "Sin actividad",
    future: "Aún no llega",
  };

  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Resumen de la semana
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatWeekRange(new Date())}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {days.map((day, index) => {
            const status = statuses[index];
            const isToday = day.date === todayKey;

            return (
              <Tooltip
                key={day.date}
                title={`${labelFor[status]} · ${day.completed} completados`}
              >
                <Stack spacing={0.75} sx={{ flex: 1, alignItems: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isToday ? "text.primary" : "text.secondary",
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    {WEEKDAY_LETTERS[index]}
                  </Typography>
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "2px solid",
                      // El día de hoy lleva un anillo para ubicarse rápido
                      outline: isToday ? "2px solid" : "none",
                      outlineColor: "primary.main",
                      outlineOffset: 2,
                      ...styleFor[status],
                    }}
                  />
                </Stack>
              </Tooltip>
            );
          })}
        </Stack>

        <Typography variant="caption" color="text.secondary">
          {fullDays} de {elapsed} días completados
        </Typography>
      </CardContent>
    </Card>
  );
}
