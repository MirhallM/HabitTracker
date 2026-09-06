"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TaskAltRounded from "@mui/icons-material/TaskAltRounded";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MuiLink from "@mui/material/Link";
import Link from "@/components/Link";
import { useAuth } from "@/context/AuthContext";
import { loginSchema } from "@/schemas/auth.schema";
import { ApiError } from "@/lib/api";

type FieldErrors = Record<string, string[] | undefined>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError(null);

    // Validación en el cliente antes de molestar al servidor
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await login(result.data.email, result.data.password);
      router.push("/dashboard");
      // No reseteamos isSubmitting: navegamos fuera y evitamos que el botón
      // parpadee habilitado durante la transición.
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
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <Stack spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                <TaskAltRounded sx={{ fontSize: 40, color: "primary.main" }} />
                <Typography variant="h5" component="h1">
                  Habit Tracker
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bienvenido de vuelta
                </Typography>
              </Stack>

              {serverError && <Alert severity="error">{serverError}</Alert>}

              <Stack spacing={2}>
                <TextField
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(fieldErrors.email)}
                  helperText={fieldErrors.email?.[0]}
                  autoComplete="email"
                  disabled={isSubmitting}
                  fullWidth
                />

                <TextField
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password?.[0]}
                  autoComplete="current-password"
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
                  "Iniciar sesión"
                )}
              </Button>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                ¿No tienes usuario?{" "}
                <MuiLink
                  component={Link}
                  href="/register"
                  sx={{ fontWeight: 500 }}
                >
                  Regístrate
                </MuiLink>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
