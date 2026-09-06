"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import TaskAltRounded from "@mui/icons-material/TaskAltRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import ChecklistRounded from "@mui/icons-material/ChecklistRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import Link from "@/components/Link";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardRounded },
  { label: "Hábitos", href: "/habits", icon: ChecklistRounded },
  { label: "Estadísticas", href: "/statistics", icon: InsightsRounded },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  function handleLogout() {
    setMenuAnchor(null);
    logout();
    router.replace("/login");
  }

  // Marca activo también en subrutas: /habits/new resalta "Hábitos"
  const activeHref =
    navItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.href ?? false;

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{ justifyContent: "space-between", gap: 2 }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <TaskAltRounded sx={{ color: "primary.main" }} />
              <Typography
                variant="body1"
                component="span"
                sx={{ fontWeight: 600, display: { xs: "none", sm: "block" } }}
              >
                Habit Tracker
              </Typography>
            </Stack>

            {/* Navegación de escritorio */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {navItems.map(({ label, href }) => (
                <Button
                  key={href}
                  component={Link}
                  href={href}
                  color={activeHref === href ? "primary" : "inherit"}
                  sx={{ fontWeight: activeHref === href ? 600 : 400 }}
                >
                  {label}
                </Button>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {user?.name}
              </Typography>
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main" }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Stack>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      {/* pb extra en móvil para que la barra inferior no tape el contenido */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 4, pb: { xs: 12, md: 4 } }}>
        {children}
      </Container>

      {/* Navegación móvil: barra inferior */}
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: "block", md: "none" },
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <BottomNavigation value={activeHref} showLabels>
          {navItems.map(({ label, href, icon: Icon }) => (
            <BottomNavigationAction
              key={href}
              component={Link}
              href={href}
              value={href}
              label={label}
              icon={<Icon />}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
