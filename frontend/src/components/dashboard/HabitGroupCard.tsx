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
import type { Habit } from "@/types/habit";

const priorityColor: Record<string, string> = {
  high: "error.main",
  medium: "warning.main",
  low: "text.disabled",
};

const priorityLabel: Record<string, string> = {
  high: "Prioridad alta",
  medium: "Prioridad media",
  low: "Prioridad baja",
};

type RowProps = {
  habit: Habit;
  onToggle: (habit: Habit, completed: boolean) => void;
  isBusy: boolean;
};

function HabitRow({ habit, onToggle, isBusy }: RowProps) {
  const done = habit.streak.completedInCurrentPeriod;

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", py: 0.5 }}>
      <Checkbox
        checked={done}
        onChange={(e) => onToggle(habit, e.target.checked)}
        disabled={isBusy}
        color="success"
        size="small"
      />

      <Tooltip title={priorityLabel[habit.priority]}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: priorityColor[habit.priority],
            flexShrink: 0,
          }}
        />
      </Tooltip>

      <Typography
        variant="body2"
        sx={{
          flex: 1,
          minWidth: 0,
          textDecoration: done ? "line-through" : "none",
          color: done ? "text.secondary" : "text.primary",
        }}
      >
        {habit.name}
      </Typography>

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
  habits: Habit[];
  onToggle: (habit: Habit, completed: boolean) => void;
  busyId: string | null;
};

export default function HabitGroupCard({
  title,
  subtitle,
  habits,
  onToggle,
  busyId,
}: Props) {
  const done = habits.filter((h) => h.streak.completedInCurrentPeriod).length;
  const allDone = done === habits.length;

  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
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
            {done} / {habits.length} completados
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
