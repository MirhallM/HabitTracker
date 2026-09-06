"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import { completedLabel, customDueLabel } from "@/lib/dates";
import { priorityMeta } from "@/lib/habit-meta";
import type { Habit } from "@/types/habit";

type RowProps = {
  habit: Habit;
  onToggle: (habit: Habit, completed: boolean) => void;
  isBusy: boolean;
};

function HabitRow({ habit, onToggle, isBusy }: RowProps) {
  const done = habit.streak.completedInCurrentPeriod;
  const priority = priorityMeta(habit.priority);

  // Solo los personalizados llevan etiqueta de vencimiento: los diarios
  // se entienden solos y los semanales la tienen a nivel de grupo.
  const dueLabel =
    habit.frequency === "custom"
      ? customDueLabel(habit.startDate, habit.intervalDays, done)
      : null;

  const isUrgent = dueLabel === "Vence hoy" || dueLabel === "Vence mañana";

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", py: 0.5 }}>
      <Checkbox
        checked={done}
        onChange={(e) => onToggle(habit, e.target.checked)}
        disabled={isBusy}
        color="success"
        size="small"
      />

      <Tooltip title={priority.longLabel}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: priority.dotColor,
            flexShrink: 0,
          }}
        />
      </Tooltip>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            textDecoration: done ? "line-through" : "none",
            color: done ? "text.secondary" : "text.primary",
          }}
        >
          {habit.name}
        </Typography>
        {dueLabel && (
          <Typography
            variant="caption"
            sx={{
              color: isUrgent && !done ? "warning.main" : "text.secondary",
              fontWeight: isUrgent && !done ? 600 : 400,
            }}
          >
            {dueLabel}
          </Typography>
        )}
      </Box>

      {habit.streak.currentStreak > 0 && (
        <Chip
          size="small"
          icon={<LocalFireDepartmentRounded />}
          label={habit.streak.currentStreak}
          color={done ? "success" : "default"}
          variant={done ? "filled" : "outlined"}
        />
      )}
    </Stack>
  );
}

type Props = {
  title: string;
  subtitle?: string | null;
  // Resalta el subtítulo cuando el período está por cerrar
  urgentSubtitle?: boolean;
  habits: Habit[];
  onToggle: (habit: Habit, completed: boolean) => void;
  busyId: string | null;
};

export default function HabitGroupCard({
  title,
  subtitle,
  urgentSubtitle,
  habits,
  onToggle,
  busyId,
}: Props) {
  const done = habits.filter((h) => h.streak.completedInCurrentPeriod).length;
  const allDone = done === habits.length;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          {/* minHeight iguala el encabezado entre tarjetas con y sin subtítulo */}
          <Box sx={{ minWidth: 0, minHeight: 44 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color:
                    urgentSubtitle && !allDone
                      ? "warning.main"
                      : "text.secondary",
                  fontWeight: urgentSubtitle && !allDone ? 600 : 400,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Typography
            variant="caption"
            sx={{
              flexShrink: 0,
              mt: 0.5,
              fontWeight: allDone ? 600 : 400,
              color: allDone ? "success.main" : "text.secondary",
            }}
          >
            {completedLabel(done, habits.length)}
          </Typography>
        </Stack>

        <Stack divider={<Divider />}>
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onToggle={onToggle}
              isBusy={busyId === habit.id}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
