import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function DashboardPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={1}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Hábitos activos, completados hoy, racha actual, mejor racha, % de
          cumplimiento y gráfica semanal — consume GET /statistics/summary y GET
          /statistics/weekly.
        </Typography>
      </Stack>
    </Container>
  );
}
