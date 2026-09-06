import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function SettingsPage() {
  return (
    <Stack spacing={1}>
      <Typography variant="h2" component="h1" sx={{ fontSize: "1.75rem" }}>
        Configuración
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Aquí podrás editar tu perfil.
      </Typography>
    </Stack>
  );
}
