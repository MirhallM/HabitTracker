"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grow from "@mui/material/Grow";
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
  // Nada vence hoy: no es un fracaso, es un día libre
  const nothingDue = total === 0;
  const allDone = total > 0 && completed >= total;

  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Progreso de hoy
        </Typography>

        {nothingDue ? (
          <Stack sx={{ mt: 1 }}>
            <Typography variant="h2" component="p" sx={{ fontSize: "1.5rem" }}>
              Sin pendientes
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Hoy no vence ningún hábito
            </Typography>
          </Stack>
        ) : (
          <>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "baseline", mt: 1 }}
            >
              <Typography
                variant="h2"
                component="p"
                sx={{
                  fontSize: "2.25rem",
                  color: allDone ? "success.main" : "text.primary",
                  transition: "color 300ms ease",
                }}
              >
                {completed}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                de {total}
              </Typography>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              {completed === 1 ? "hábito completado" : "hábitos completados"}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={Math.min(percent, 100)}
              color="success"
              sx={{ mt: 1.5, mb: 1 }}
            />

            {/* minHeight reserva el espacio: el mensaje aparece sin
                que la tarjeta cambie de altura */}
            <Box sx={{ minHeight: 22, display: "flex", alignItems: "center" }}>
              {allDone ? (
                <Grow in timeout={400}>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: "center" }}
                  >
                    <CelebrationRounded
                      sx={{ fontSize: 18, color: "success.main" }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "success.main", fontWeight: 600 }}
                    >
                      ¡Todo listo por hoy!
                    </Typography>
                  </Stack>
                </Grow>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {percent}% completado
                </Typography>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
