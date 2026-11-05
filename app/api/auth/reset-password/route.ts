import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, email, newPassword } = validation.data;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const validToken = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (
      !validToken ||
      validToken.identifier !== email ||
      validToken.expires < new Date()
    ) {
      return NextResponse.json(
        { message: "El enlace es inválido o ha expirado." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Actualizar contraseña + invalidar tokens + resetear 2FA
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          twoFactorCode: null,
          twoFactorExpiresAt: null,
          hasVerifiedOtp: false, // Debe re-verificar OTP en siguiente login
        },
      }),
      prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    ]);

    return NextResponse.json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
