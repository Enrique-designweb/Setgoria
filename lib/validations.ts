// lib/validations.ts
import { z } from "zod"; // 👈 una sola importación

export const forgotPasswordSchema = z.object({
  email: z.string().email("Correo inválido").toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, "Token inválido"),
  email: z.string().email("Correo inválido").toLowerCase().trim(),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Za-z]/, "Debe contener al menos una letra")
    .regex(/[0-9]/, "Debe contener al menos un número"),
});

export const createPaymentSchema = z.object({
  plan: z.enum(["WEEKLY", "MONTHLY"]),
  method: z.enum(["QVAPAY", "TRANSFERMOVIL", "CARD", "USDT"]),
});
