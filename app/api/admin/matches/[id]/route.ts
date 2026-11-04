// app/api/admin/matches/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// EDITAR PARTIDO
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ message: "No autorizado" }, { status: 403 });

  const { league, homeTeam, awayTeam, matchDate } = await req.json();
  const { id } = params;

  try {
    await prisma.match.update({
      where: { id },
      data: { league, homeTeam, awayTeam, matchDate: new Date(matchDate) },
    });
    return NextResponse.json({ message: "Partido actualizado" });
  } catch (error) {
    // 👈 Usamos el error para logs del servidor
    console.error("Error al actualizar partido:", error);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

// ELIMINAR PARTIDO
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ message: "No autorizado" }, { status: 403 });

  try {
    await prisma.match.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Partido eliminado" });
  } catch (error) {
    // 👈 Usamos el error para logs del servidor
    console.error("Error al eliminar partido:", error);
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
