// app/api/admin/predictions/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PredictionResult } from "@/src/generated/prisma/client";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const { result } = await req.json();

    const updated = await prisma.prediction.update({
      where: { id },
      data: { result: result as PredictionResult },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error actualizando pronóstico:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
