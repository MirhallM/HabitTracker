"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import SwapVertRounded from "@mui/icons-material/SwapVertRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import EmptyState from "@/components/EmptyState";
import { frequencyMeta } from "@/lib/habit-meta";
import type { HabitPerformance } from "@/services/stats.service";

type SortKey = "rate-desc" | "rate-asc" | "streak" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "rate-desc", label: "Mejor cumplimiento" },
  { value: "rate-asc", label: "Necesitan atención" },
  { value: "streak", label: "Racha actual" },
  { value: "name", label: "Nombre A → Z" },
];

// Los hábitos sin períodos vencidos no tienen cumplimiento que comparar,
// así que van al final sin importar el orden elegido.
function sortPerformance(items: HabitPerformance[], key: SortKey) {
  const byName = (a: HabitPerformance, b: HabitPerformance) =>
    a.name.localeCompare(b.name, "es");

  return [...items].sort((a, b) => {
    if (key !== "name") {
      const aHasData = a.expected > 0 ? 0 : 1;
      const bHasData = b.expected > 0 ? 0 : 1;
      if (aHasData !== bHasData) return aHasData - bHasData;
    }

    switch (key) {
      case "rate-asc":
        return a.rate - b.rate || byName(a, b);
      case "streak":
        return b.currentStreak - a.currentStreak || byName(a, b);
      case "name":
        return byName(a, b);
      case "rate-desc":
      default:
        return b.rate - a.rate || byName(a, b);
    }
  });
}

function HabitRow({ item }: { item: HabitPerformance }) {
  const hasData = item.expected > 0;
  const frequencyText = frequencyMeta(item.frequency).label;

  return (
    <Box sx={{ py: 1.5 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "baseline" }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, flexShrink: 0 }}
          color={hasData ? "text.primary" : "text.secondary"}
        >
          {hasData ? `${item.rate}%` : "—"}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={hasData ? item.rate : 0}
        color="success"
        aria-label={`Cumplimiento de ${item.name}`}
        sx={{ mt: 1, bgcolor: "action.hover" }}
      />

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 1, alignItems: "center", flexWrap: "wrap", gap: 0.5 }}
      >
        <Typography variant="caption" color="text.secondary">
          {frequencyText} ·{" "}
          {hasData
            ? `${item.completed} de ${item.expected} períodos`
            : "Sin períodos vencidos todavía"}
        </Typography>

        <Box sx={{ flex: 1 }} />

        {item.currentStreak > 0 && (
          <Tooltip title="Racha actual">
            <Chip
              size="small"
              variant="outlined"
              icon={<LocalFireDepartmentRounded />}
              label={item.currentStreak}
            />
          </Tooltip>
        )}
        {item.bestStreak > 0 && (
          <Tooltip title="Mejor racha">
            <Chip
              size="small"
              variant="outlined"
              icon={<EmojiEventsRounded />}
              label={item.bestStreak}
            />
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}

export default function HabitBreakdownCard({
  performance,
}: {
  performance: HabitPerformance[];
}) {
  const [sort, setSort] = useState<SortKey>("rate-desc");
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const current =
    SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];
  const rows = sortPerformance(performance, sort);

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
              Rendimiento por hábito
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Últimos 30 días · solo hábitos activos
            </Typography>
          </Box>

          {performance.length > 1 && (
            <Button
              size="small"
              color="inherit"
              startIcon={<SwapVertRounded />}
              onClick={(event) => setAnchor(event.currentTarget)}
              aria-haspopup="menu"
              aria-expanded={Boolean(anchor)}
              aria-label={`Ordenar por: ${current.label}`}
              sx={{ flexShrink: 0, minWidth: 0, maxWidth: { xs: 150, sm: "none" } }}
            >
              <Box
                component="span"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {current.label}
              </Box>
            </Button>
          )}
        </Stack>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === sort}
              onClick={() => {
                setSort(option.value);
                setAnchor(null);
              }}
            >
              <ListItemText>{option.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>

        {rows.length === 0 ? (
          <EmptyState
            size="sm"
            icon={InsightsRounded}
            description="No tienes hábitos activos que medir. Crea uno o restaura alguno archivado."
            sx={{ py: 4 }}
          />
        ) : (
          <Stack divider={<Divider />}>
            {rows.map((item) => (
              <HabitRow key={item.habitId} item={item} />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
