"use client";

import { useState } from "react";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TuneRounded from "@mui/icons-material/TuneRounded";
import {
  countActiveFilters,
  EMPTY_FILTERS,
  NO_CATEGORY,
  type AdvancedFilters,
} from "@/lib/habit-filters";
import { FREQUENCY_OPTIONS, PRIORITY_OPTIONS } from "@/lib/habit-meta";

type Group = {
  key: keyof AdvancedFilters;
  title: string;
  options: { value: string; label: string }[];
};

type Props = {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  // Categorías reales de los hábitos del usuario, no una lista inventada
  categories: string[];
  hasUncategorized: boolean;
};

export default function HabitFiltersPopover({
  filters,
  onChange,
  categories,
  hasUncategorized,
}: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const activeCount = countActiveFilters(filters);

  const categoryOptions = [
    ...categories.map((c) => ({ value: c, label: c })),
    ...(hasUncategorized
      ? [{ value: NO_CATEGORY, label: "Sin categoría" }]
      : []),
  ];

  const groups: Group[] = [
    { key: "priorities", title: "Prioridad", options: PRIORITY_OPTIONS },
    // El formulario explica "cada cierto número de días"; aquí basta la
    // etiqueta corta, así que se reusa la del chip.
    {
      key: "frequencies",
      title: "Frecuencia",
      options: FREQUENCY_OPTIONS.map((o) => ({
        value: o.value,
        label: o.value === "custom" ? "Personalizado" : o.label,
      })),
    },
    ...(categoryOptions.length > 0
      ? [
          {
            key: "categories" as const,
            title: "Categoría",
            options: categoryOptions,
          },
        ]
      : []),
  ];

  function toggle(group: keyof AdvancedFilters, value: string) {
    const current = filters[group];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [group]: next });
  }

  return (
    <>
      <Badge badgeContent={activeCount} color="primary">
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<TuneRounded />}
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-haspopup="dialog"
          aria-expanded={Boolean(anchor)}
          aria-label={
            activeCount > 0
              ? `Filtros, ${activeCount} aplicados`
              : "Filtros"
          }
        >
          Filtros
        </Button>
      </Badge>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: {
            // Alto acotado con scroll interno: en móvil el popover nunca
            // debe crecer más que la pantalla.
            sx: { width: 280, maxHeight: "70vh", mt: 1 },
          },
        }}
      >
        <Stack sx={{ p: 2 }} spacing={2}>
          {groups.map((group) => (
            <Box key={group.key}>
              <Typography
                variant="overline"
                component="p"
                color="text.secondary"
              >
                {group.title}
              </Typography>
              <Stack>
                {group.options.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        size="small"
                        checked={filters[group.key].includes(option.value)}
                        onChange={() => toggle(group.key, option.value)}
                      />
                    }
                    label={
                      <Typography variant="body2">{option.label}</Typography>
                    }
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>

        <Divider />

        <Stack
          direction="row"
          spacing={1}
          sx={{ p: 1.5, justifyContent: "space-between" }}
        >
          <Button
            size="small"
            onClick={() => onChange(EMPTY_FILTERS)}
            disabled={activeCount === 0}
          >
            Limpiar
          </Button>
          <Button size="small" onClick={() => setAnchor(null)}>
            Listo
          </Button>
        </Stack>
      </Popover>
    </>
  );
}
