import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function NewHabitPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={1}>
        <Typography variant="h4">Nuevo hábito</Typography>
        <Typography variant="body2" color="text.secondary">
          Formulario: nombre, descripción, categoría, frecuencia, prioridad,
          fecha de inicio — se conecta a POST /habits.
        </Typography>
      </Stack>
    </Container>
  );
}
