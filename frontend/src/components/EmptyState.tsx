"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";
import type { ReactNode } from "react";

// Escalas de espaciado: "md" para vacíos que ocupan la pantalla,
// "sm" para los que viven dentro de una tarjeta.
const SIZES = {
  sm: { icon: 44, iconMb: 1.5, descMb: 2 },
  md: { icon: 56, iconMb: 2, descMb: 3 },
};

type Props = {
  icon: SvgIconComponent;
  // Opcional: los vacíos dentro de una tarjeta se leen mejor sin título
  title?: string;
  description: string;
  action?: ReactNode;
  size?: keyof typeof SIZES;
  sx?: SxProps<Theme>;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  sx,
}: Props) {
  const scale = SIZES[size];

  return (
    <Box sx={{ textAlign: "center", ...sx }}>
      <Icon
        sx={{ fontSize: scale.icon, color: "text.disabled", mb: scale.iconMb }}
      />

      {title && (
        <Typography variant="h3" component="p" sx={{ fontSize: "1.25rem" }}>
          {title}
        </Typography>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: title ? 1 : 0, mb: action ? scale.descMb : 0 }}
      >
        {description}
      </Typography>

      {action}
    </Box>
  );
}
