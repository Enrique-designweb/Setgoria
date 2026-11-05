// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const paymentLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "24 h"),
  analytics: true,
  prefix: "@upstash/ratelimit/setgoria_payments",
});

// 👈 nuevo limitador para auth (recuperación de contraseña, login, etc.)
export const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 intentos cada 10 min por IP
  analytics: true,
  prefix: "@upstash/ratelimit/setgoria_auth",
});
