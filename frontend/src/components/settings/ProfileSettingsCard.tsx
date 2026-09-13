"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AvatarUpload from "@/components/AvatarUpload";
import { useAuth } from "@/context/AuthContext";
import { updateMe } from "@/services/user.service";
import { profileSchema } from "@/schemas/user.schema";
import { ApiError } from "@/lib/api";

type FieldErrors = Record<string, string[] | undefined>;

export default function ProfileSettingsCard({
  onSuccess,
}: {
  onSuccess: (message: string) => void;
}) {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sin cambios reales no hay nada que guardar; el botón lo refleja.
  const isDirty = name.trim() !== (user?.name ?? "");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError(null);

    const result = profileSchema.safeParse({ name });
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // Solo se manda `name`: omitir `avatar` deja la foto intacta, y
      // mandar cualquier otro campo daría 400 por forbidNonWhitelisted.
      const updated = await updateMe({ name: result.data.name });
      // setUser actualiza el nombre del navbar sin recargar la página.
      setUser(updated);
      setName(updated.name);
      onSuccess("Tu nombre fue actualizado");
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "No se pudo guardar tu perfil",
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
            Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Así te ve la aplicación.
          </Typography>
        </Stack>

        {/* Componente ya existente: se reutiliza, no se duplica */}
        <AvatarUpload />

        <Divider sx={{ my: 3 }} />

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name?.[0]}
              autoComplete="name"
              disabled={isSubmitting}
              fullWidth
            />

            <TextField
              label="Correo electrónico"
              value={user?.email ?? ""}
              helperText="El correo no se puede cambiar."
              slotProps={{ input: { readOnly: true } }}
              disabled
              fullWidth
            />

            <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !isDirty}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
