// app/api/admin/users/[id]/strike/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json(); // 'YELLOW' o 'RED'

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    if (action === 'YELLOW') {
      const newStrikes = user.strikes + 1;
      // Si llega a 2 strikes con la amarilla, lo baneamos automáticamente
      const shouldBan = newStrikes >= 2;

      await prisma.user.update({
        where: { id },
        data: { 
          strikes: newStrikes,
          isBanned: shouldBan ? true : user.isBanned
        },
      });

      await prisma.notification.create({
        data: {
          userId: id,
          message: "⚠️ Has recibido una Tarjeta Amarilla (Advertencia). Si acumulas otra, serás expulsado del grupo."
        }
      });

      return NextResponse.json({ 
        message: shouldBan ? "Tarjeta amarilla asignada. Límite alcanzado, usuario baneado." : "Tarjeta amarilla asignada (Advertencia)",
        banned: shouldBan
      });
    }

    if (action === 'RED') {
      await prisma.user.update({
        where: { id },
        data: { strikes: 2, isBanned: true },
      });

      await prisma.notification.create({
        data: {
          userId: id,
          message: "🚫 Has recibido una Tarjeta Roja. Has sido expulsado del grupo por incumplir las normas."
        }
      });

      return NextResponse.json({ message: "Tarjeta roja asignada (Usuario expulsado)", banned: true });
    }

    return NextResponse.json({ message: "Acción no válida" }, { status: 400 });

  } catch (error: unknown) { // 👈 CORREGIDO AQUÍ
    console.error("Error aplicando sanción:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
