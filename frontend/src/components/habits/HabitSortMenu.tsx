"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import SwapVertRounded from "@mui/icons-material/SwapVertRounded";
import type { SortKey } from "@/lib/habit-filters";

// Solo criterios que los datos existentes soportan de verdad.
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "name-asc", label: "Nombre A → Z" },
  { value: "name-desc", label: "Nombre Z → A" },
  { value: "priority", label: "Prioridad" },
  { value: "streak", label: "Racha" },
  { value: "due", label: "Próximo vencimiento" },
];

type Props = {
  value: SortKey;
  onChange: (value: SortKey) => void;
  // En archivados no tiene sentido ordenar por vencimiento: su período
  // dejó de correr cuando se archivaron.
  hideDue?: boolean;
};

export default function HabitSortMenu({ value, onChange, hideDue }: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const options = hideDue
    ? SORT_OPTIONS.filter((o) => o.value !== "due")
    : SORT_OPTIONS;

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<SwapVertRounded />}
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-label={`Ordenar por: ${current.label}`}
        // En móvil el botón se acota y la etiqueta se recorta con puntos
        // suspensivos: "Próximo vencimiento" desbordaría una pantalla de 360px.
        sx={{ minWidth: 0, maxWidth: { xs: 190, sm: "none" } }}
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

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === value}
            onClick={() => {
              onChange(option.value);
              setAnchor(null);
            }}
          >
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
