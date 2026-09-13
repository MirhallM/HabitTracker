"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FREQUENCY_ORDER, frequencyMeta } from "@/lib/habit-meta";
import { chartColors } from "@/theme/theme";
import type { HabitPerformance } from "@/services/stats.service";

type Props = { performance: HabitPerformance[] };

// La gráfica de 30 días solo cubre hábitos diarios. Esta tarjeta existe para
// que los semanales y personalizados no queden invisibles en la página: su
// cumplimiento se cuenta en PERÍODOS, que es como el backend los mide.
export default function FrequencyBreakdownCard({ performance }: Props) {
  const groups = FREQUENCY_ORDER.map((frequency, index) => {
    const items = performance.filter((p) => p.frequency === frequency);
    const expected = items.reduce((sum, p) => sum + p.expected, 0);
    const completed = items.reduce((sum, p) => sum + p.completed, 0);

    return {
      frequency,
      label: frequencyMeta(frequency).pluralLabel,
      color: chartColors[index % chartColors.length],
      count: items.length,
      expected,
      completed,
      // null = todavía no venció ningún período de esa frecuencia
      rate: expected === 0 ? null : Math.round((completed / expected) * 100),
    };
  }).filter((group) => group.count > 0);

  if (groups.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Por tipo de frecuencia
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Períodos cumplidos en los últimos 30 días
        </Typography>

        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
          {groups.map((group) => (
            <Box key={group.frequency}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between", alignItems: "baseline" }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {group.label}
                  <Typography
                    variant="caption"
                    component="span"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {group.count === 1 ? "1 hábito" : `${group.count} hábitos`}
                  </Typography>
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {group.rate === null ? "—" : `${group.rate}%`}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={group.rate ?? 0}
                aria-label={`Cumplimiento de hábitos ${group.label.toLowerCase()}`}
                sx={{
                  mt: 1,
                  // Cada frecuencia con su color de la paleta de gráficas,
                  // para que coincida con el resto de la página.
                  "& .MuiLinearProgress-bar": { bgcolor: group.color },
                  bgcolor: "action.hover",
                }}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}
              >
                {group.expected === 0
                  ? "Todavía no vence ningún período"
                  : `${group.completed} de ${group.expected} períodos`}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
