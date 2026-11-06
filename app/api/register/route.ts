// app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Función para generar un código único: SETG-A1B2C3
function generateReferralCode() {
  return "SETG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const { name, email, password, birthDate, ref } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 1. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "El correo ya está registrado" }, { status: 400 });
    }

    // 2. Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear el nuevo usuario con su propio código de referido
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        birthDate: birthDate ? new Date(birthDate) : null,
        referralCode: generateReferralCode(), // 👈 Código generado
      },
    });

    // 4. Lógica de referidos (Si el usuario vino con un ?ref=...)
    if (ref) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: ref },
      });

      // Verificamos que el referidor exista y no sea el mismo usuario
      if (referrer && referrer.id !== newUser.id) {
        
        // Vincular al nuevo usuario con su referidor
        await prisma.user.update({
          where: { id: newUser.id },
          data: { referredById: referrer.id },
        });

        // Calcular fecha de expiración (3 días desde hoy)
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        // A) Dar suscripción al NUEVO usuario
        await prisma.subscription.create({
          data: {
            userId: newUser.id,
            plan: "WEEKLY",
            status: "ACTIVE",
            expiresAt: threeDaysFromNow,
          },
        });

        // B) Dar o extender suscripción al REFERIDOR
        const referrerSub = await prisma.subscription.findFirst({
          where: { userId: referrer.id, status: "ACTIVE", expiresAt: { gt: new Date() } },
        });

        if (referrerSub) {
          const newExpireDate = new Date(referrerSub.expiresAt);
          newExpireDate.setDate(newExpireDate.getDate() + 3);
          await prisma.subscription.update({
            where: { id: referrerSub.id },
            data: { expiresAt: newExpireDate },
          });
        } else {
          await prisma.subscription.create({
            data: {
              userId: referrer.id,
              plan: "WEEKLY",
              status: "ACTIVE",
              expiresAt: threeDaysFromNow,
            },
          });
        }
      }
    }

    return NextResponse.json({ message: "Usuario registrado con éxito", userId: newUser.id }, { status: 201 });

  } catch (error: unknown) {
    console.error("Error en registro:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
