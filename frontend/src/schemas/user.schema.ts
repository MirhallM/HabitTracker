import { z } from "zod";

export const profileSchema = z.object({
  // trim antes de validar: " A " tiene 3 caracteres pero un solo nombre real,
  // y el backend recibiría los espacios tal cual.
  name: z
    .string()
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres" }),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: "Ingresa tu contraseña actual" }),
    // Mismo mínimo que el registro y que ChangePasswordDto en el backend.
    newPassword: z
      .string()
      .min(8, { error: "La nueva contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: z
      .string()
      .min(1, { error: "Confirma tu nueva contraseña" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  // El backend también lo rechaza; avisarlo aquí evita el viaje de ida y vuelta.
  .refine((data) => data.newPassword !== data.currentPassword, {
    error: "La nueva contraseña debe ser distinta de la actual",
    path: ["newPassword"],
  });

export type PasswordInput = z.infer<typeof passwordSchema>;
