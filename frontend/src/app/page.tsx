"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TaskAltRounded from "@mui/icons-material/TaskAltRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import EventRepeatRounded from "@mui/icons-material/EventRepeatRounded";
import Link from "@/components/Link";
import RegisterForm from "@/components/forms/RegisterForm";
import { useAuth } from "@/context/AuthContext";

const features = [
  {
    icon: EventRepeatRounded,
    title: "Hábitos a tu ritmo",
    text: "Diarios, semanales o cada cierto número de días.",
  },
  {
    icon: LocalFireDepartmentRounded,
    title: "Rachas que motivan",
    text: "Mantén la cadena viva y mira cuánto llevas.",
  },
  {
    icon: InsightsRounded,
    title: "Tu progreso, visible",
    text: "Estadísticas claras de lo que has cumplido.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Si ya hay sesión, no tiene sentido mostrar el registro
  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [isLoading, user, router]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <TaskAltRounded sx={{ color: "primary.main" }} />
              <Typography
                variant="body1"
                component="span"
                sx={{ fontWeight: 600 }}
              >
                Habit Tracker
              </Typography>
            </Stack>
            <Button component={Link} href="/login" variant="outlined">
              Iniciar sesión
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 5, md: 10 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 5, md: 8 },
            alignItems: "center",
          }}
        >
          {/* Columna izquierda: presentación del producto */}
          <Stack spacing={4} sx={{ flex: 1 }}>
            <Stack spacing={2}>
              <Typography
                variant="h1"
                component="h1"
                sx={{ fontSize: { xs: "2.25rem", md: "3rem" } }}
              >
                Construye hábitos que sí duran
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Crea tus hábitos, márcalos día a día y mira tu progreso en un
                solo lugar. Sin complicaciones.
              </Typography>
            </Stack>

            <Stack spacing={2.5}>
              {features.map(({ icon: Icon, title, text }) => (
                <Stack
                  key={title}
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "flex-start" }}
                >
                  <Icon sx={{ color: "primary.main", mt: 0.25 }} />
                  <Box>
                    <Typography variant="subtitle1">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {text}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Stack>

          {/* Columna derecha: formulario de registro */}
          <Box sx={{ width: "100%", maxWidth: 440, flexShrink: 0 }}>
            <Card>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <RegisterForm />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      <Divider />
      <Box component="footer" sx={{ py: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1">
            Habit Tracker
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
