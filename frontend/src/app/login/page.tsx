import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function LoginPage() {
  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Stack spacing={1}>
        <Typography variant="h4">Iniciar sesión</Typography>
        <Typography variant="body2" color="text.secondary">
          Formulario de login (email + contraseña) — se conecta a POST
          /auth/login.
        </Typography>
      </Stack>
    </Container>
  );
}
