import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@/components/Link";

export default function HomePage() {
  return (
    <Container maxWidth="sm" sx={{ py: 12 }}>
      <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: "2.25rem", sm: "3rem" } }}
        >
          Habit Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Crea tus hábitos, dales seguimiento día a día y mira tu progreso en un
          solo lugar.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            size="large"
          >
            Iniciar sesión
          </Button>
          <Button
            component={Link}
            href="/register"
            variant="outlined"
            size="large"
          >
            Crear cuenta
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
