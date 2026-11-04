// app/api/admin/matches/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sport } from "@/src/generated/prisma/client"; // 👈 Importamos el Enum

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const { league, homeTeam, awayTeam, matchDate, sport } = await req.json();

    if (!league || !homeTeam || !awayTeam || !matchDate) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const newMatch = await prisma.match.create({
      data: {
        league,
        homeTeam,
        awayTeam,
        matchDate: new Date(matchDate),
        sport: (sport as Sport) || "FUTBOL", // 👈 Guardamos el deporte
      }
    });

    return NextResponse.json(newMatch, { status: 201 });
  } catch (error) {
    console.error("Error creando partido:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
