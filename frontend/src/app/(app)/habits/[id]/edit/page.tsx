"use client";

import { use, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Link from "@/components/Link";
import HabitForm from "@/components/forms/HabitForm";
import { getHabit } from "@/services/habit.service";
import { ApiError } from "@/lib/api";
import type { Habit } from "@/types/habit";

export default function EditHabitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // En Next.js 15+ los params son una promesa; use() la desenvuelve.
  const { id } = use(params);

  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getHabit(id);
        if (!cancelled) setHabit(data);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "No se pudo cargar el hábito",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Container maxWidth="sm" disableGutters>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h2" component="h1" sx={{ fontSize: "1.75rem" }}>
            Editar hábito
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ajusta lo que necesites y guarda los cambios.
          </Typography>
        </Stack>

        {isLoading && <Skeleton variant="rounded" height={520} />}

        {!isLoading && loadError && (
          <Alert
            severity="error"
            action={
              <Button
                component={Link}
                href="/habits"
                color="inherit"
                size="small"
              >
                Volver
              </Button>
            }
          >
            {loadError}
          </Alert>
        )}

        {!isLoading && !loadError && habit && (
          <Card>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Al recibir un hábito, HabitForm entra en modo edición */}
              <HabitForm habit={habit} />
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
