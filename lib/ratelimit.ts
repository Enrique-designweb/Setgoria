// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Ventana deslizante: 3 intentos por cada 24 horas
export const paymentLimiter = new Ratelimit({
  redis: Redis.fromEnv(), // Toma las variables de tu .env automáticamente
  limiter: Ratelimit.slidingWindow(3, "24 h"),
  analytics: true,
  prefix: "@upstash/ratelimit/setgoria_payments",
});
