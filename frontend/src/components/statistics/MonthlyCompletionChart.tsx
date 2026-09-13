"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ShowChartRounded from "@mui/icons-material/ShowChartRounded";
import { LineChart } from "@mui/x-charts/LineChart";
import EmptyState from "@/components/EmptyState";
import { formatShortDate, parseDayKey } from "@/lib/dates";
import { chartColors } from "@/theme/theme";
import type { DailyCompletion } from "@/services/stats.service";

export default function MonthlyCompletionChart({
  days,
}: {
  days: DailyCompletion[];
}) {
  // Solo los días que tenían algo que cumplir entran en los promedios.
  const counted = days.filter((day) => day.expected > 0);

  const totalExpected = counted.reduce((sum, day) => sum + day.expected, 0);
  const totalCompleted = counted.reduce((sum, day) => sum + day.completed, 0);
  const average =
    totalExpected === 0
      ? 0
      : Math.round((totalCompleted / totalExpected) * 100);
  const fullDays = counted.filter((day) => day.completed >= day.expected).length;

  // Un día sin hábitos esperados no es un 0%: es un hueco en la serie.
  // connectNulls viene desactivado por defecto, así que la línea se corta.
  const rates = days.map((day) =>
    day.expected === 0
      ? null
      : Math.round((day.completed / day.expected) * 100),
  );
  const labels = days.map((day) => day.date);

  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Cumplimiento de los últimos 30 días
            </Typography>
            {/* El endpoint solo agrega hábitos diarios: un semanal no
                pertenece a un día concreto. Se dice, no se disimula. */}
            <Typography variant="caption" color="text.secondary">
              Solo hábitos diarios
            </Typography>
          </Box>

          {counted.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {average}% en promedio · {fullDays} de {counted.length} días
              completos
            </Typography>
          )}
        </Stack>

        {counted.length === 0 ? (
          <EmptyState
            size="sm"
            icon={ShowChartRounded}
            description="Todavía no hay hábitos diarios con historial en este período."
            sx={{ py: 4 }}
          />
        ) : (
          <LineChart
            height={260}
            series={[
              {
                data: rates,
                area: true,
                curve: "monotoneX",
                showMark: false,
                color: chartColors[0],
                valueFormatter: (value) =>
                  value === null ? "Sin hábitos ese día" : `${value}%`,
              },
            ]}
            xAxis={[
              {
                data: labels,
                scaleType: "point",
                // Una etiqueta por semana: 30 fechas seguidas no caben
                // en un teléfono.
                tickInterval: (_value: string, index: number) =>
                  index % 7 === 0,
                valueFormatter: (value: string) =>
                  formatShortDate(parseDayKey(value)),
              },
            ]}
            yAxis={[
              {
                min: 0,
                max: 100,
                valueFormatter: (value: number) => `${value}%`,
              },
            ]}
            grid={{ horizontal: true }}
            hideLegend
          />
        )}
      </CardContent>
    </Card>
  );
}
