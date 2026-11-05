// app/api/admin/matches/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// EDITAR PARTIDO
export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // 👈 AHORA ES UNA PROMESA
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ message: "No autorizado" }, { status: 403 });

  const { league, homeTeam, awayTeam, matchDate } = await req.json();
  
  // 👈 ESPERAMOS A QUE LA PROMESA SE RESUELVA
  const { id } = await params; 

  try {
    await prisma.match.update({
      where: { id },
      data: { league, homeTeam, awayTeam, matchDate: new Date(matchDate) },
    });
    return NextResponse.json({ message: "Partido actualizado" });
  } catch (error) {
    console.error("Error al actualizar partido:", error);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

// ELIMINAR PARTIDO
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // 👈 AHORA ES UNA PROMESA
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ message: "No autorizado" }, { status: 403 });

  // 👈 ESPERAMOS A QUE LA PROMESA SE RESUELVA
  const { id } = await params; 

  try {
    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ message: "Partido eliminado" });
  } catch (error) {
    console.error("Error al eliminar partido:", error);
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
