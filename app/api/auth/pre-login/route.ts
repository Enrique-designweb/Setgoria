// app/api/auth/pre-login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendLoginOTPEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return NextResponse.json({ message: "Credenciales incorrectas" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "Credenciales incorrectas" }, { status: 401 });
    }

    // 👈 SI YA VERIFICÓ EL OTP ANTES, NO LE PEDIMOS OTP DE NUEVO
    if (user.hasVerifiedOtp) {
      return NextResponse.json({ requires2FA: false });
    }

    // Si es la primera vez, generamos y enviamos el OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: hashedOtp, twoFactorExpiresAt: expiresAt }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('\n=========================================');
      console.log(`🔐 CÓDIGO OTP PARA ${user.email}: ${otpCode}`);
      console.log('=========================================\n');
    }

    await sendLoginOTPEmail(user.email!, otpCode);

    return NextResponse.json({ requires2FA: true });

  } catch (error) {
    console.error("Error en pre-login:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
