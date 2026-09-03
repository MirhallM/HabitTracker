import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function RegisterPage() {
  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Stack spacing={1}>
        <Typography variant="h4">Crear cuenta</Typography>
        <Typography variant="body2" color="text.secondary">
          Formulario de registro (nombre + email + contraseña) — se conecta a
          POST /auth/register.
        </Typography>
      </Stack>
    </Container>
  );
}
