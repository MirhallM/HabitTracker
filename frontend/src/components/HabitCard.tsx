"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import Link from "@/components/Link";
import type { Habit } from "@/types/habit";

const frequencyLabels: Record<string, string> = {
  daily: "Diario",
  weekly: "Semanal",
  custom: "Personalizado",
};

type PriorityConfig = { label: string; color: "default" | "warning" | "error" };

const priorityConfig: Record<string, PriorityConfig> = {
  low: { label: "Baja", color: "default" },
  medium: { label: "Media", color: "warning" },
  high: { label: "Alta", color: "error" },
};

type Props = {
  habit: Habit;
  onToggle: (habit: Habit, completed: boolean) => void;
  onDelete: (habit: Habit) => void;
  isBusy?: boolean;
};

export default function HabitCard({
  habit,
  onToggle,
  onDelete,
  isBusy,
}: Props) {
  const { streak } = habit;
  const priority = priorityConfig[habit.priority] ?? priorityConfig.medium;

  const frequencyLabel =
    habit.frequency === "custom" && habit.intervalDays
      ? `Cada ${habit.intervalDays} días`
      : (frequencyLabels[habit.frequency] ?? habit.frequency);

  return (
    <Card sx={{ opacity: habit.active ? 1 : 0.6 }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
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
              disabled={isBusy || !habit.active}
              color="success"
              sx={{ mt: -1 }}
            />
          </Tooltip>

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
              <Chip size="small" label={frequencyLabel} variant="outlined" />
              <Chip
                size="small"
                label={priority.label}
                color={priority.color}
              />
              {habit.category && (
                <Chip size="small" label={habit.category} variant="outlined" />
              )}
              {!habit.active && <Chip size="small" label="Inactivo" />}

              {streak.currentStreak > 0 && (
                <Chip
                  size="small"
                  icon={<LocalFireDepartmentRounded />}
                  label={streak.currentStreak}
                  // Success cuando ya se cumplió en el período actual,
                  // gris con contorno cuando la racha viene de antes.
                  color={
                    streak.completedInCurrentPeriod ? "success" : "default"
                  }
                  variant={
                    streak.completedInCurrentPeriod ? "filled" : "outlined"
                  }
                />
              )}
            </Stack>
          </Box>

          <Stack direction="row">
            <Tooltip title="Editar">
              <IconButton
                component={Link}
                href={`/habits/${habit.id}/edit`}
                size="small"
              >
                <EditRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                onClick={() => onDelete(habit)}
                size="small"
                color="error"
              >
                <DeleteOutlineRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
