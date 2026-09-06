"use client";

import { useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import PhotoCameraRounded from "@mui/icons-material/PhotoCameraRounded";
import { updateMe } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB antes de redimensionar
const OUTPUT_SIZE = 256; // px del lado del avatar final

// Recorta la imagen en cuadrado centrado, la reduce a OUTPUT_SIZE y la
// exporta como JPEG. Sin esto, una foto de celular pesaría varios MB.
async function resizeToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no puede procesar la imagen");

  // JPEG no soporta transparencia: si el PNG venía transparente,
  // sin este fondo blanco saldría negro.
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function AvatarUpload() {
  const { user, setUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Limpiamos el input para que elegir el mismo archivo otra vez
    // vuelva a disparar onChange.
    event.target.value = "";
    if (!file) return;

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("La imagen no debe pesar más de 8 MB");
      return;
    }

    setIsSaving(true);
    try {
      const dataUrl = await resizeToDataUrl(file);
      const updated = await updateMe({ avatar: dataUrl });
      setUser(updated);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo actualizar tu foto",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateMe({ avatar: null });
      setUser(updated);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo quitar tu foto",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack spacing={2} sx={{ alignItems: "center" }}>
      <Box sx={{ position: "relative" }}>
        <Avatar
          src={user?.avatar ?? undefined}
          sx={{
            width: 112,
            height: 112,
            bgcolor: "primary.main",
            fontSize: 40,
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        {isSaving && (
          <CircularProgress
            size={112}
            sx={{ position: "absolute", top: 0, left: 0 }}
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          startIcon={<PhotoCameraRounded />}
          onClick={() => inputRef.current?.click()}
          disabled={isSaving}
        >
          {user?.avatar ? "Cambiar foto" : "Subir foto"}
        </Button>
        {user?.avatar && (
          <Button
            size="small"
            color="error"
            onClick={handleRemove}
            disabled={isSaving}
          >
            Quitar Foto
          </Button>
        )}
      </Stack>

      {/* El input real va oculto: los inputs de archivo nativos no se pueden
          estilizar, así que se dispara desde un Button de MUI. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        hidden
      />
    </Stack>
  );
}
