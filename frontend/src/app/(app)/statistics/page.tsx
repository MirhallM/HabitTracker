import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function StatisticsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={1}>
        <Typography variant="h4">Estadísticas</Typography>
        <Typography variant="body2" color="text.secondary">
          Total de hábitos, activos, finalizados, días consecutivos y progreso
          mensual — consume GET /statistics/summary y GET /statistics/monthly.
        </Typography>
      </Stack>
    </Container>
  );
}
