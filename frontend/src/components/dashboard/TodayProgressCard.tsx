"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import CelebrationRounded from "@mui/icons-material/CelebrationRounded";

type Props = {
  completed: number;
  total: number;
  percent: number;
};

export default function TodayProgressCard({
  completed,
  total,
  percent,
}: Props) {
  // Solo celebramos si de verdad había algo que hacer y se hizo todo
  const allDone = total > 0 && completed >= total;

  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Progreso de hoy
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "baseline", mt: 1 }}
        >
          <Typography variant="h2" component="p" sx={{ fontSize: "2.25rem" }}>
            {completed}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            de {total}
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          hábitos completados
        </Typography>

        <LinearProgress
          variant="determinate"
          value={Math.min(percent, 100)}
          color="success"
          sx={{ mt: 1.5, mb: 1 }}
        />

        {allDone ? (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <CelebrationRounded sx={{ fontSize: 18, color: "success.main" }} />
            <Typography
              variant="caption"
              sx={{ color: "success.main", fontWeight: 600 }}
            >
              ¡Todo listo por hoy!
            </Typography>
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {percent}% completado
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
