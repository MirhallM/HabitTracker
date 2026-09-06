import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import HabitForm from "@/components/forms/HabitForm";

export default function NewHabitPage() {
  return (
    <Container maxWidth="sm" disableGutters>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h2" component="h1" sx={{ fontSize: "1.75rem" }}>
            Nuevo hábito
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define qué quieres construir y con qué frecuencia.
          </Typography>
        </Stack>

        <Card>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <HabitForm />
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
