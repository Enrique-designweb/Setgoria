// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = resetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });
    }

    const { token, email, newPassword } = validation.data;

    // 1. Hashear el token recibido para compararlo con el de la BD
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Buscar el token en la BD
    const validToken = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
    });

    // 3. Validar que exista, que sea para el mismo correo y que no haya expirado
    if (!validToken || validToken.identifier !== email || validToken.expires < new Date()) {
      return NextResponse.json({ message: "El enlace es inválido o ha expirado." }, { status: 400 });
    }

    // 4. Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Actualizar al usuario y eliminar el token
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: { token: hashedToken },
      }),
    ]);

    return NextResponse.json({ message: "Contraseña actualizada correctamente." });

  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
