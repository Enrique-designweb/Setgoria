// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email"; // 👈 Lo crearemos ahora

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) return NextResponse.json({ message: "El correo es obligatorio" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    // Por seguridad, si el usuario no existe, no lo decimos (evita enumeración de correos)
    if (!user) {
      return NextResponse.json({ message: "Si el correo existe, recibirás un enlace." });
    }

    // 1. Generar un token seguro y aleatorio
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // Expira en 1 hora

    // 2. Limpiar tokens viejos de este usuario y guardar el nuevo
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires: expiresAt,
      },
    });

    // 3. Crear la URL de reseteo
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}&email=${email}`;

    // 4. Log para pruebas locales
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=========================================');
      console.log(`🔗 ENLACE DE RECUPERACIÓN: ${resetUrl}`);
      console.log('=========================================\n');
    }

    // 5. Enviar correo
    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ message: "Si el correo existe, recibirás un enlace." });

  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
