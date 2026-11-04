// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, birthDate } = await req.json();

    if (!email || !password || !birthDate) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 👈 VALIDACIÓN DE EDAD (+18)
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    if (age < 18) {
      return NextResponse.json({ message: "Debes ser mayor de 18 años para registrarte" }, { status: 403 });
    }

    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return NextResponse.json({ message: "El correo ya está registrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        birthDate: birth, // 👈 Guardamos la fecha
      }
    });

    return NextResponse.json({ message: "Usuario creado exitosamente" }, { status: 201 });

  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
