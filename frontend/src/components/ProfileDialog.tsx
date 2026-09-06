"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import CloseRounded from "@mui/icons-material/CloseRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import Link from "@/components/Link";
import AvatarUpload from "@/components/AvatarUpload";
import { useAuth } from "@/context/AuthContext";
import { getSummary, type StatsSummary } from "@/services/stats.service";
import { ApiError } from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ProfileDialog({ open, onClose }: Props) {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Solo pedimos datos cuando el diálogo se abre, no en cada carga de página.
    if (!open) return;

    let cancelled = false;

    async function load() {
      try {
        const data = await getSummary();
        if (cancelled) return;
        setStats(data);
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
  }, [open]);

  const totals = [
    { label: "Activos", value: stats?.activeHabits },
    { label: "Finalizados", value: stats?.finishedHabits },
    { label: "Total creados", value: stats?.totalHabits },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      {/* Encabezado con fondo tenue, al estilo de la tarjeta de Habitica */}
      <Box sx={{ bgcolor: "background.default", pt: 4, pb: 3, px: 3 }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", top: 8, right: 8 }}
          aria-label="Cerrar"
        >
          <CloseRounded />
        </IconButton>

        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <AvatarUpload />

          <Stack spacing={0.25} sx={{ alignItems: "center" }}>
            <Typography
              variant="h3"
              component="p"
              sx={{ fontSize: "1.375rem" }}
            >
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            {user?.createdAt && (
              <Typography variant="caption" color="text.secondary">
                Miembro desde {formatDate(user.createdAt)}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {isLoading && <Skeleton variant="rounded" height={200} />}

        {!isLoading && loadError && <Alert severity="error">{loadError}</Alert>}

        {!isLoading && !loadError && stats && (
          <Stack spacing={3}>
            {/* Progreso de hoy */}
            <Box>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Hoy</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.completedToday} / {stats.activeHabits} hábitos
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(stats.completionRate, 100)}
                color="success"
              />
            </Box>

            <Divider />

            {/* Rachas */}
            <Stack direction="row" spacing={2}>
              <Stack
                spacing={0.5}
                sx={{ flex: 1, alignItems: "center", textAlign: "center" }}
              >
                <LocalFireDepartmentRounded
                  sx={{
                    color: stats.completedSomethingToday
                      ? "success.main"
                      : "text.disabled",
                  }}
                />
                <Typography
                  variant="h3"
                  component="p"
                  sx={{ fontSize: "1.5rem" }}
                >
                  {stats.activeDaysStreak}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Días seguidos
                </Typography>
              </Stack>

              <Divider orientation="vertical" flexItem />

              <Stack
                spacing={0.5}
                sx={{ flex: 1, alignItems: "center", textAlign: "center" }}
              >
                <EmojiEventsRounded sx={{ color: "warning.main" }} />
                <Typography
                  variant="h3"
                  component="p"
                  sx={{ fontSize: "1.5rem" }}
                >
                  {stats.bestActiveDaysStreak}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mejor racha
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            {/* Totales */}
            <Stack direction="row" spacing={2}>
              {totals.map(({ label, value }) => (
                <Stack
                  key={label}
                  spacing={0.5}
                  sx={{ flex: 1, alignItems: "center", textAlign: "center" }}
                >
                  <Typography
                    variant="h3"
                    component="p"
                    sx={{ fontSize: "1.25rem" }}
                  >
                    {value ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Button
              component={Link}
              href="/settings"
              onClick={onClose}
              variant="contained"
              startIcon={<SettingsRounded />}
              fullWidth
            >
              Editar perfil
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
