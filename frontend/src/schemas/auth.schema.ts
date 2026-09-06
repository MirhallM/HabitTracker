import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Ingresa un correo electrónico válido" }),
  password: z.string().min(1, { error: "La contraseña es obligatoria" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
