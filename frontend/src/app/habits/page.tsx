import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@/components/Link";

export default function HabitsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="h4">Mis hábitos</Typography>
          <Button component={Link} href="/habits/new" variant="contained">
            Nuevo hábito
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Lista de hábitos (HabitCard por cada uno) — consume GET /habits.
        </Typography>
      </Stack>
    </Container>
  );
}
