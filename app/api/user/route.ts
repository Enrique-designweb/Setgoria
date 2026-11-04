// app/api/user/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET: Obtener los datos del usuario actual
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      birthDate: true,
      role: true,
      createdAt: true,
    }
  });

  return NextResponse.json(user);
}

// PUT: Actualizar los datos del usuario
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { name, birthDate } = await req.json();

    // Validar edad si se envía birthDate
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
      }
      if (age < 18) {
        return NextResponse.json({ message: "Debes ser mayor de 18 años" }, { status: 403 });
      }
    }

    // Actualizamos en Neon
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
