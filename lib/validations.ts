// lib/validations.ts
import { z } from "zod";

// Definimos los valores permitidos como constantes
const VALID_PLANS = ["WEEKLY", "MONTHLY"] as const;
const VALID_METHODS = ["QVAPAY", "TRANSFERMOVIL", "CARD", "USDT"] as const;

export const createPaymentSchema = z.object({
  plan: z.string().refine(
    (val) => (VALID_PLANS as readonly string[]).includes(val), 
    { message: "El plan debe ser 'WEEKLY' o 'MONTHLY'" }
  ),
  method: z.string().refine(
    (val) => (VALID_METHODS as readonly string[]).includes(val), 
    { message: "Método de pago no válido" }
  ),
});
