"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import { pluralizeDays } from "@/lib/dates";

type Props = {
  current: number;
  best: number;
  activeToday: boolean;
};

export default function StreakCard({ current, best, activeToday }: Props) {
  return (
    <Card sx={{ flex: 1, display: "flex" }}>
      {/* flex + justifyContent center: el contenido queda centrado
          verticalmente aunque la tarjeta vecina sea más alta */}
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
        >
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <LocalFireDepartmentRounded
                sx={{
                  fontSize: 18,
                  color: activeToday ? "success.main" : "text.disabled",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Racha actual
              </Typography>
            </Stack>
            <Typography variant="h2" component="p" sx={{ fontSize: "1.75rem" }}>
              {pluralizeDays(current)}
            </Typography>
          </Stack>

          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <EmojiEventsRounded
                sx={{ fontSize: 18, color: "warning.main" }}
              />
              <Typography variant="body2" color="text.secondary">
                Mejor racha
              </Typography>
            </Stack>
            <Typography variant="h2" component="p" sx={{ fontSize: "1.75rem" }}>
              {pluralizeDays(best)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
