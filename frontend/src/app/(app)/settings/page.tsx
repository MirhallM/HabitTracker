"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import ProfileSettingsCard from "@/components/settings/ProfileSettingsCard";
import PasswordSettingsCard from "@/components/settings/PasswordSettingsCard";
import { useAuth } from "@/context/AuthContext";
import { formatLongDate } from "@/lib/dates";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  // Mismo par que ya hace AppShell: limpiar sesión y salir con replace,
  // para que "atrás" no regrese a una pantalla protegida.
  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Stack spacing={0.5}>
        <Typography variant="h2" component="h1" sx={{ fontSize: "1.75rem" }}>
          Configuración
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Administra tu perfil y tu cuenta.
        </Typography>
      </Stack>

      {/* El toast vive aquí para que las dos tarjetas compartan uno solo */}
      <ProfileSettingsCard onSuccess={setToast} />

      <PasswordSettingsCard onSuccess={setToast} />

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Cuenta
            </Typography>
            {user?.createdAt && (
              <Typography variant="body2" color="text.secondary">
                Miembro desde {formatLongDate(user.createdAt)}
              </Typography>
            )}
          </Stack>

          <Button
            onClick={handleLogout}
            variant="outlined"
            color="error"
            startIcon={<LogoutRounded />}
          >
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={Boolean(toast)}
        message={toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
      />
    </Stack>
  );
}
