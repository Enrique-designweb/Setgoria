// app/api/admin/predictions/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const { matchId, type, probability, isPremium } = await req.json();

    if (!matchId || !type || probability === undefined) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const newPrediction = await prisma.prediction.create({
      data: {
        matchId,
        type,
        probability: Number(probability),
        isPremium: Boolean(isPremium),
      }
    });

    return NextResponse.json(newPrediction, { status: 201 });
  } catch (error) {
    console.error("Error creando pronóstico:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
