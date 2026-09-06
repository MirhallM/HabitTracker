"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // replace en vez de push: no queremos que "atrás" regrese
    // a una pantalla protegida sin sesión.
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  // Mientras se verifica la sesión, o mientras se redirige, no mostramos
  // la pantalla: evita el parpadeo de contenido protegido.
  if (isLoading || !user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
