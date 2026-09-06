"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import ProfileDialog from "@/components/ProfileDialog";
import Tooltip from "@mui/material/Tooltip";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import TaskAltRounded from "@mui/icons-material/TaskAltRounded";
import HomeRounded from "@mui/icons-material/HomeRounded";
import ChecklistRounded from "@mui/icons-material/ChecklistRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import NotificationsNoneRounded from "@mui/icons-material/NotificationsNoneRounded";
import Link from "@/components/Link";
import { useAuth } from "@/context/AuthContext";

const DRAWER_WIDTH = 220;

const navItems = [
  { label: "Inicio", href: "/dashboard", icon: HomeRounded },
  { label: "Hábitos", href: "/habits", icon: ChecklistRounded },
  { label: "Stats", href: "/statistics", icon: InsightsRounded },
  { label: "Config", href: "/settings", icon: SettingsRounded },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);

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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* La barra superior queda por encima del drawer */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <TaskAltRounded sx={{ color: "primary.main" }} />
            <Typography
              variant="body1"
              component="span"
              sx={{ fontWeight: 600 }}
            >
              Habit Tracker
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              / {user?.name}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <Tooltip title="Notificaciones (próximamente)">
              <IconButton>
                <NotificationsNoneRounded />
              </IconButton>
            </Tooltip>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <Avatar
                src={user?.avatar ?? undefined}
                sx={{ width: 34, height: 34, bgcolor: "primary.main" }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Stack>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setProfileOpen(true);
              }}
            >
              Mi perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar — solo en escritorio */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {/* Empuja la lista debajo de la barra superior fija */}
        <Toolbar />
        <List sx={{ px: 1.5, py: 2 }}>
          {navItems.map(({ label, href, icon: Icon }) => (
            <ListItem key={href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={href}
                selected={activeHref === href}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon
                    fontSize="small"
                    sx={{
                      color: activeHref === href ? "primary.main" : "inherit",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{
                    primary: {
                      variant: "body2",
                      sx: { fontWeight: activeHref === href ? 600 : 400 },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ flex: 1, py: 4, pb: { xs: 12, md: 4 } }}>
          {children}
        </Container>

        <Divider />
        <Box component="footer" sx={{ py: 3, pb: { xs: 12, md: 3 } }}>
          <Container maxWidth="lg">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Habit Tracker — Proyecto de Experiencia de Usuario, UNITEC
            </Typography>
          </Container>
        </Box>
      </Box>

      {/* Navegación móvil */}
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
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </Box>
  );
}
