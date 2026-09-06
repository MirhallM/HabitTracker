"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MuiLink from "@mui/material/Link";
import Link from "@/components/Link";
import { useAuth } from "@/context/AuthContext";
import { registerSchema } from "@/schemas/auth.schema";
import { ApiError } from "@/lib/api";

type FieldErrors = Record<string, string[] | undefined>;

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Un solo manejador para los cuatro campos, en vez de cuatro funciones
  function handleChange(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError(null);

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // confirmPassword NO se manda: el backend lo rechazaría por
      // forbidNonWhitelisted, ya que no existe en RegisterDto.
      const { name, email, password } = result.data;
      await register(name, email, password);
      router.push("/dashboard");
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
        <Stack spacing={0.5}>
          <Typography variant="h3" component="h2">
            Crea tu cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Empieza a construir mejores hábitos hoy.
          </Typography>
        </Stack>

        {serverError && <Alert severity="error">{serverError}</Alert>}

        <Stack spacing={2}>
          <TextField
            label="Nombre"
            value={form.name}
            onChange={handleChange("name")}
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name?.[0]}
            autoComplete="name"
            disabled={isSubmitting}
            fullWidth
          />
          <TextField
            label="Correo electrónico"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email?.[0]}
            autoComplete="email"
            disabled={isSubmitting}
            fullWidth
          />
          <TextField
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password?.[0] ?? "Mínimo 8 caracteres"}
            autoComplete="new-password"
            disabled={isSubmitting}
            fullWidth
          />
          <TextField
            label="Confirmar contraseña"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={Boolean(fieldErrors.confirmPassword)}
            helperText={fieldErrors.confirmPassword?.[0]}
            autoComplete="new-password"
            disabled={isSubmitting}
            fullWidth
          />
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Crear cuenta"
          )}
        </Button>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          ¿Ya tienes usuario?{" "}
          <MuiLink component={Link} href="/login" sx={{ fontWeight: 500 }}>
            Inicia sesión
          </MuiLink>
        </Typography>
      </Stack>
    </Box>
  );
}
