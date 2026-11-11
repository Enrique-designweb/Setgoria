// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations";
import { authLimiter } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success } = await authLimiter.limit(`forgot:${ip}`);
    if (!success) {
      return NextResponse.json(
        { message: "Demasiados intentos. Espera unos minutos." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });

    const successMessage = { message: "Si el correo existe, recibirás un enlace." };

    if (!user || !user.password) {
      return NextResponse.json(successMessage);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { identifier: email } }),
      prisma.verificationToken.create({
        data: { identifier: email, token: hashedToken, expires: expiresAt },
      }),
    ]);

    // 👇 AQUÍ SE DEFINE resetUrl
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    if (process.env.NODE_ENV === "development") {
      console.log("\n=========================================");
      console.log(`🔗 ENLACE DE RECUPERACIÓN: ${resetUrl}`);
      console.log("=========================================\n");
    }

    // 👇 Obtenemos el User-Agent y enviamos los 4 parámetros
    const userAgent = req.headers.get("user-agent") || "Navegador Web";
    
    try {
      await sendPasswordResetEmail(email, resetUrl, ip, userAgent);
    } catch (emailError) {
      console.error("Error enviando email de recuperación:", emailError);
    }

    return NextResponse.json(successMessage);
  } catch (error: unknown) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
