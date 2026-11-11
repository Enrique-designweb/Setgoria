// app/api/auth/pre-login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendLoginOTPEmail } from "@/lib/email";
import { authLimiter } from "@/lib/ratelimit"; // 👈 Importamos el limitador

export async function POST(req: Request) {
  try {
    // 👇 1. Rate Limiting por IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "Navegador Web";
    
    const { success } = await authLimiter.limit(`login:${ip}`);
    if (!success) {
      return NextResponse.json(
        { message: "Demasiados intentos fallidos. Espera 10 minutos." },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ message: "Faltan datos" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return NextResponse.json({ message: "Credenciales incorrectas" }, { status: 401 });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return NextResponse.json({ message: "Credenciales incorrectas" }, { status: 401 });

    if (user.hasVerifiedOtp) return NextResponse.json({ requires2FA: false });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: hashedOtp, twoFactorExpiresAt: expiresAt }
    });

    // 👇 2. Enviamos el correo con IP y dispositivo
    await sendLoginOTPEmail(user.email!, otpCode, ip, userAgent);

    return NextResponse.json({ requires2FA: true });

  } catch (error: unknown) {
    console.error("Error en pre-login:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
