"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { changePassword } from "@/services/user.service";
import { passwordSchema } from "@/schemas/user.schema";
import { ApiError } from "@/lib/api";

type FieldErrors = Record<string, string[] | undefined>;

const EMPTY_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function PasswordSettingsCard({
  onSuccess,
}: {
  onSuccess: (message: string) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
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

    const result = passwordSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // confirmPassword NO se manda: no existe en ChangePasswordDto y
      // forbidNonWhitelisted lo rechazaría con un 400.
      await changePassword({
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
      });
      // Nunca dejar contraseñas escritas en pantalla después de guardar.
      setForm(EMPTY_FORM);
      onSuccess("Tu contraseña fue actualizada");
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "No se pudo cambiar tu contraseña",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Necesitas tu contraseña actual para poder cambiarla.
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
              label="Contraseña actual"
              type="password"
              value={form.currentPassword}
              onChange={handleChange("currentPassword")}
              error={Boolean(fieldErrors.currentPassword)}
              helperText={fieldErrors.currentPassword?.[0]}
              autoComplete="current-password"
              disabled={isSubmitting}
              fullWidth
            />

            <TextField
              label="Nueva contraseña"
              type="password"
              value={form.newPassword}
              onChange={handleChange("newPassword")}
              error={Boolean(fieldErrors.newPassword)}
              helperText={fieldErrors.newPassword?.[0] ?? "Mínimo 8 caracteres"}
              autoComplete="new-password"
              disabled={isSubmitting}
              fullWidth
            />

            <TextField
              label="Confirmar nueva contraseña"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              error={Boolean(fieldErrors.confirmPassword)}
              helperText={fieldErrors.confirmPassword?.[0]}
              autoComplete="new-password"
              disabled={isSubmitting}
              fullWidth
            />

            <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Cambiar contraseña"
                )}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
