"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import ButtonBase from "@mui/material/ButtonBase";
import { formatWeekRange, startOfDay } from "@/lib/dates";
import type { DailyCompletion } from "@/services/stats.service";

// El backend devuelve la semana de lunes a domingo
const WEEKDAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

type DayStatus = "full" | "partial" | "empty" | "future";

const dotStyle: Record<DayStatus, object> = {
  full: { bgcolor: "success.main", borderColor: "success.main" },
  partial: {
    bgcolor: "transparent",
    borderColor: "success.main",
    // Media luna: comunica "a medias" sin introducir un color nuevo
    backgroundImage: (theme: { palette: { success: { main: string } } }) =>
      `linear-gradient(to top, ${theme.palette.success.main} 50%, transparent 50%)`,
  },
  empty: { bgcolor: "transparent", borderColor: "divider" },
  future: { bgcolor: "transparent", borderColor: "divider", opacity: 0.4 },
};

const statusLabel: Record<DayStatus, string> = {
  full: "Día completo",
  partial: "Parcialmente cumplido",
  empty: "Sin actividad",
  future: "Aún no llega",
};

export default function WeekSummaryCard({ days }: { days: DailyCompletion[] }) {
  const todayKey = startOfDay(new Date()).toISOString().slice(0, 10);

  function statusFor(day: DailyCompletion): DayStatus {
    // Un día que todavía no llega no es un fracaso
    if (day.date > todayKey) return "future";
    if (day.expected === 0) return "empty";
    if (day.completed >= day.expected) return "full";
    return day.completed > 0 ? "partial" : "empty";
  }

  const statuses = days.map(statusFor);

  // Solo cuentan los días transcurridos que tenían hábitos asignados
  const counted = days.filter(
    (d, i) => statuses[i] !== "future" && d.expected > 0,
  ).length;
  const fullDays = statuses.filter((s) => s === "full").length;

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

            const detail =
              status === "future"
                ? statusLabel.future
                : `${statusLabel[status]} · ${day.completed} de ${day.expected}`;

            return (
              <Tooltip
                key={day.date}
                title={detail}
                // enterTouchDelay 0: en móvil se muestra al tocar,
                // sin esperar a una pulsación larga
                enterTouchDelay={0}
                leaveTouchDelay={2500}
              >
                {/* ButtonBase lo hace enfocable con teclado además de
                    tocable, para que el detalle sea accesible sin mouse */}
                <ButtonBase
                  focusRipple
                  aria-label={`${WEEKDAY_LETTERS[index]}: ${detail}`}
                  sx={{ flex: 1, borderRadius: 1, py: 0.5 }}
                >
                  <Stack spacing={0.75} sx={{ flex: 1, alignItems: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isToday ? "primary.main" : "text.secondary",
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
                        // Anillo alrededor del día de hoy
                        outline: isToday ? "2px solid" : "none",
                        outlineColor: "primary.main",
                        outlineOffset: 2,
                        ...dotStyle[status],
                      }}
                    />
                  </Stack>
                </ButtonBase>
              </Tooltip>
            );
          })}
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Completaste {fullDays} de {counted} días
        </Typography>
      </CardContent>
    </Card>
  );
}
