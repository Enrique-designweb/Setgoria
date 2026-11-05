import crypto from "crypto";

export function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export function verifyOtp(plain: string, hashed: string): boolean {
  const computed = hashOtp(plain);
  if (computed.length !== hashed.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hashed));
}
