"use client";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ClearRounded from "@mui/icons-material/ClearRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import HabitFiltersPopover from "@/components/habits/HabitFiltersPopover";
import HabitSortMenu from "@/components/habits/HabitSortMenu";
import type {
  AdvancedFilters,
  QuickFilter,
  SortKey,
} from "@/lib/habit-filters";

// "Todos" va sin icono a propósito: no representa un estado, solo quita el
// filtro. Los demás llevan icono Y texto, nunca icono solo.
const QUICK_FILTERS: {
  value: QuickFilter;
  label: string;
  icon?: SvgIconComponent;
}[] = [
  { value: "all", label: "Todos" },
  { value: "completed", label: "Completados", icon: CheckCircleRounded },
  { value: "pending", label: "Por hacer", icon: RadioButtonUncheckedRounded },
  { value: "urgent", label: "Urgentes", icon: LocalFireDepartmentRounded },
];

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  quickFilter: QuickFilter;
  onQuickFilterChange: (value: QuickFilter) => void;
  // Los archivados no tienen "completado" ni "urgente": esos estados se miden
  // contra el período actual, y un hábito archivado ya no participa en él.
  showQuickFilters: boolean;

  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  categories: string[];
  hasUncategorized: boolean;

  sort: SortKey;
  onSortChange: (value: SortKey) => void;

  activeFilterCount: number;
  onClearFilters: () => void;
  resultCount: number;
};

export default function HabitsToolbar({
  search,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
  showQuickFilters,
  filters,
  onFiltersChange,
  categories,
  hasUncategorized,
  sort,
  onSortChange,
  activeFilterCount,
  onClearFilters,
  resultCount,
}: Props) {
  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ alignItems: { xs: "stretch", sm: "center" } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar hábitos…"
            size="small"
            fullWidth
            slotProps={{
              htmlInput: { "aria-label": "Buscar hábitos" },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" color="disabled" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => onSearchChange("")}
                      aria-label="Limpiar búsqueda"
                      edge="end"
                    >
                      <ClearRounded fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <HabitFiltersPopover
            filters={filters}
            onChange={onFiltersChange}
            categories={categories}
            hasUncategorized={hasUncategorized}
          />
          <HabitSortMenu
            value={sort}
            onChange={onSortChange}
            hideDue={!showQuickFilters}
          />
        </Stack>
      </Stack>

      {showQuickFilters && (
        <Stack
          direction="row"
          spacing={1}
          // En pantallas angostas la fila se desplaza dentro de su propio
          // contenedor; nunca debe generar scroll horizontal de la página.
          sx={{ overflowX: "auto", flexWrap: "nowrap", pb: 0.5 }}
        >
          {QUICK_FILTERS.map(({ value, label, icon: Icon }) => {
            const selected = quickFilter === value;
            return (
              <Chip
                key={value}
                component="button"
                type="button"
                onClick={() => onQuickFilterChange(value)}
                aria-pressed={selected}
                label={label}
                icon={Icon ? <Icon /> : undefined}
                // El estado activo no se distingue solo por color: cambia
                // también el relleno y el grosor del texto.
                color={selected ? "primary" : "default"}
                variant={selected ? "filled" : "outlined"}
                sx={{
                  flexShrink: 0,
                  cursor: "pointer",
                  fontWeight: selected ? 600 : 400,
                }}
              />
            );
          })}
        </Stack>
      )}

      {/* Resumen de lo que se está viendo + salida rápida de los filtros.
          aria-live avisa del nuevo conteo a quien use lector de pantalla. */}
      {activeFilterCount > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {resultCount === 1
              ? "1 hábito encontrado"
              : `${resultCount} hábitos encontrados`}
          </Typography>
          <Button size="small" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
