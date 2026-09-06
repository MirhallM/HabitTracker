"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { habitSchema } from "@/schemas/habit.schema";
import { createHabit, updateHabit } from "@/services/habit.service";
import { ApiError } from "@/lib/api";
import type { Habit } from "@/types/habit";

type FieldErrors = Record<string, string[] | undefined>;

const frequencies = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "custom", label: "Cada cierto número de días" },
];

const priorities = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

// Si recibe un hábito, edita; si no, crea.
export default function HabitForm({ habit }: { habit?: Habit }) {
  const router = useRouter();
  const isEditing = Boolean(habit);

  const [form, setForm] = useState({
    name: habit?.name ?? "",
    description: habit?.description ?? "",
    category: habit?.category ?? "",
    frequency: habit?.frequency ?? "daily",
    priority: habit?.priority ?? "medium",
    intervalDays: habit?.intervalDays?.toString() ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError(null);

    const result = habitSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const data = result.data;
    // Los campos vacíos se omiten en vez de mandarse como "": el backend
    // los tiene como opcionales, y "" no es lo mismo que "sin valor".
    const payload = {
      name: data.name,
      frequency: data.frequency,
      priority: data.priority,
      ...(data.description ? { description: data.description } : {}),
      ...(data.category ? { category: data.category } : {}),
      ...(data.frequency === "custom"
        ? { intervalDays: Number(data.intervalDays) }
        : {}),
    };

    try {
      if (habit) {
        await updateHabit(habit.id, payload);
      } else {
        await createHabit(payload);
      }
      router.push("/habits");
      router.refresh();
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Ocurrió un error inesperado",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        {serverError && <Alert severity="error">{serverError}</Alert>}

        <Stack spacing={2}>
          <TextField
            label="Nombre del hábito"
            value={form.name}
            onChange={handleChange("name")}
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name?.[0] ?? "Por ejemplo: Leer 20 minutos"}
            disabled={isSubmitting}
            fullWidth
          />

          <TextField
            label="Descripción (opcional)"
            value={form.description}
            onChange={handleChange("description")}
            disabled={isSubmitting}
            multiline
            minRows={2}
            fullWidth
          />

          <TextField
            label="Categoría (opcional)"
            value={form.category}
            onChange={handleChange("category")}
            helperText="Salud, estudio, descanso…"
            disabled={isSubmitting}
            fullWidth
          />

          <TextField
            select
            label="Frecuencia"
            value={form.frequency}
            onChange={handleChange("frequency")}
            disabled={isSubmitting}
            fullWidth
          >
            {frequencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Solo aparece cuando hace falta */}
          {form.frequency === "custom" && (
            <TextField
              label="Cada cuántos días"
              type="number"
              value={form.intervalDays}
              onChange={handleChange("intervalDays")}
              error={Boolean(fieldErrors.intervalDays)}
              helperText={fieldErrors.intervalDays?.[0] ?? "Mínimo 2 días"}
              disabled={isSubmitting}
              fullWidth
            />
          )}

          <TextField
            select
            label="Prioridad"
            value={form.priority}
            onChange={handleChange("priority")}
            disabled={isSubmitting}
            fullWidth
          >
            {priorities.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button
            onClick={() => router.push("/habits")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : isEditing ? (
              "Guardar cambios"
            ) : (
              "Crear hábito"
            )}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
