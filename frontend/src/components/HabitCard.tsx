"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import MoreVertRounded from "@mui/icons-material/MoreVertRounded";
import ArchiveRounded from "@mui/icons-material/ArchiveRounded";
import UnarchiveRounded from "@mui/icons-material/UnarchiveRounded";
import Link from "@/components/Link";
import { frequencyLabel, priorityMeta } from "@/lib/habit-meta";
import { formatShortDate } from "@/lib/dates";
import type { Habit } from "@/types/habit";

type Props = {
  habit: Habit;
  onToggle: (habit: Habit, completed: boolean) => void;
  onDelete: (habit: Habit) => void;
  onArchive: (habit: Habit) => void;
  onRestore: (habit: Habit) => void;
  isBusy?: boolean;
};

export default function HabitCard({
  habit,
  onToggle,
  onDelete,
  onArchive,
  onRestore,
  isBusy,
}: Props) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const { streak } = habit;
  const isArchived = habit.archivedAt !== null;
  const priority = priorityMeta(habit.priority);
  const frequencyText = frequencyLabel(habit);

  // En un hábito archivado la racha actual siempre acabará decayendo a cero,
  // porque se mide contra el período de hoy. Lo que conserva sentido —y lo
  // que el usuario quiere recordar— es la mejor racha que llegó a tener.
  const streakValue = isArchived ? streak.bestStreak : streak.currentStreak;
  const streakTooltip = isArchived ? "Mejor racha" : "Racha actual";

  function closeMenu() {
    setMenuAnchor(null);
  }

  // Cada acción cierra el menú antes de ejecutarse, para que el foco vuelva
  // al botón que lo abrió y no quede colgando en un elemento desmontado.
  function runAndClose(action: () => void) {
    return () => {
      closeMenu();
      action();
    };
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
          {!isArchived && (
            <Tooltip
              title={
                streak.completedInCurrentPeriod
                  ? "Marcar como no cumplido"
                  : "Marcar como cumplido"
              }
            >
              <Checkbox
                checked={streak.completedInCurrentPeriod}
                onChange={(e) => onToggle(habit, e.target.checked)}
                disabled={isBusy}
                color="success"
                slotProps={{
                  input: { "aria-label": `Marcar ${habit.name}` },
                }}
                sx={{ mt: -1 }}
              />
            </Tooltip>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {habit.name}
            </Typography>

            {habit.description && (
              <Typography variant="body2" color="text.secondary">
                {habit.description}
              </Typography>
            )}

            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}
            >
              <Chip size="small" label={frequencyText} variant="outlined" />
              <Chip
                size="small"
                label={priority.label}
                color={priority.chipColor}
              />
              {habit.category && (
                <Chip size="small" label={habit.category} variant="outlined" />
              )}

              {isArchived && habit.archivedAt && (
                <Chip
                  size="small"
                  icon={<ArchiveRounded />}
                  label={`Archivado el ${formatShortDate(habit.archivedAt)}`}
                />
              )}

              {streakValue > 0 && (
                <Tooltip title={streakTooltip}>
                  <Chip
                    size="small"
                    icon={<LocalFireDepartmentRounded />}
                    label={streakValue}
                    // Success cuando ya se cumplió en el período actual,
                    // gris con contorno cuando la racha viene de antes.
                    color={
                      !isArchived && streak.completedInCurrentPeriod
                        ? "success"
                        : "default"
                    }
                    variant={
                      !isArchived && streak.completedInCurrentPeriod
                        ? "filled"
                        : "outlined"
                    }
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>

          <Stack direction="row">
            {/* Editar se queda visible por ser la acción frecuente y no
                destructiva; archivar y eliminar viven en el menú. */}
            {!isArchived && (
              <Tooltip title="Editar">
                <IconButton
                  component={Link}
                  href={`/habits/${habit.id}/edit`}
                  size="small"
                  aria-label={`Editar ${habit.name}`}
                >
                  <EditRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Más acciones">
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                aria-label={`Acciones de ${habit.name}`}
                aria-haspopup="menu"
                aria-expanded={Boolean(menuAnchor)}
                disabled={isBusy}
              >
                <MoreVertRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
          >
            {isArchived
              ? [
                  <MenuItem
                    key="restore"
                    onClick={runAndClose(() => onRestore(habit))}
                  >
                    <ListItemIcon>
                      <UnarchiveRounded fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Restaurar</ListItemText>
                  </MenuItem>,
                ]
              : [
                  <MenuItem
                    key="archive"
                    onClick={runAndClose(() => onArchive(habit))}
                  >
                    <ListItemIcon>
                      <ArchiveRounded fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Archivar</ListItemText>
                  </MenuItem>,
                ]}

            <Divider />

            <MenuItem
              onClick={runAndClose(() => onDelete(habit))}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteOutlineRounded fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Eliminar</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </CardContent>
    </Card>
  );
}
