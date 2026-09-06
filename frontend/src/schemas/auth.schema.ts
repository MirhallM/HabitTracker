import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Ingresa un correo electrónico válido" }),
  password: z.string().min(1, { error: "La contraseña es obligatoria" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { error: "El nombre debe tener al menos 2 caracteres" }),
    email: z.email({ error: "Ingresa un correo electrónico válido" }),
    password: z
      .string()
      .min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: z.string().min(1, { error: "Confirma tu contraseña" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
