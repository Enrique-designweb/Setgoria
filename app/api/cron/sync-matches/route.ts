// app/api/cron/sync-matches/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFootballMatches } from "@/lib/football-api";
import { Sport } from "@/src/generated/prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  // ✅ Verificar el secreto solo en producción
  if (process.env.NODE_ENV === "production" && expectedSecret) {
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const matches = await getFootballMatches();
    let upserted = 0;

    for (const m of matches) {
      await prisma.match.upsert({
        where: { id: m.id },
        update: {
          league: m.league,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          matchDate: new Date(m.matchDate),
          sport: Sport.FUTBOL,
        },
        create: {
          id: m.id,
          league: m.league,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          matchDate: new Date(m.matchDate),
          sport: Sport.FUTBOL,
        },
      });
      upserted++;
    }

    return NextResponse.json({
      ok: true,
      fetched: matches.length,
      upserted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en cron sync-matches:", error);
    return NextResponse.json(
      { error: "Sync failed", details: error instanceof Error ? error.message : "unknown" },
      { status: 500 }
    );
  }
}
