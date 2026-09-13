"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SvgIconComponent } from "@mui/icons-material";

type Props = {
  icon: SvgIconComponent;
  // Token de la paleta; por defecto el color de texto secundario
  iconColor?: string;
  label: string;
  value: string;
  caption?: string;
};

export default function StatTile({
  icon: Icon,
  iconColor = "text.disabled",
  label,
  value,
  caption,
}: Props) {
  return (
    <Card sx={{ flex: 1, display: "flex" }}>
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Icon sx={{ fontSize: 18, color: iconColor }} />
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Stack>

        <Typography
          variant="h2"
          component="p"
          sx={{ fontSize: "1.75rem", mt: 0.5 }}
        >
          {value}
        </Typography>

        {/* minHeight reserva el hueco del pie para que las tres tarjetas
            queden a la misma altura aunque alguna no tenga caption */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", minHeight: 18 }}
        >
          {caption ?? ""}
        </Typography>
      </CardContent>
    </Card>
  );
}
