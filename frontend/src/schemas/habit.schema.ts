import { z } from "zod";

export const habitSchema = z
  .object({
    name: z
      .string()
      .min(2, { error: "El nombre debe tener al menos 2 caracteres" }),
    description: z.string(),
    category: z.string(),
    frequency: z.enum(["daily", "weekly", "custom"]),
    priority: z.enum(["low", "medium", "high"]),
    // Viene de un <input>, así que llega como texto aunque sea un número
    intervalDays: z.string(),
  })
  .refine(
    (data) => {
      if (data.frequency !== "custom") return true;
      const n = Number(data.intervalDays);
      return Number.isInteger(n) && n >= 2;
    },
    {
      error: "Indica cada cuántos días (2 o más)",
      path: ["intervalDays"],
    },
  );

export type HabitInput = z.infer<typeof habitSchema>;
