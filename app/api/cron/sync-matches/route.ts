// app/api/cron/sync-matches/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFootballMatches } from "@/lib/football-api";
import { Sport, MatchStatus } from "@/src/generated/prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  // Seguridad para Vercel Cron
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
          status: m.status as MatchStatus,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          elapsed: m.elapsed,
          // 👇 IMPORTANTE: No actualizamos 'videoUrl' en el update para no borrar el video que pongas manualmente
        },
        create: {
          id: m.id,
          league: m.league,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          matchDate: new Date(m.matchDate),
          sport: Sport.FUTBOL,
          status: m.status as MatchStatus,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          elapsed: m.elapsed,
          videoUrl: m.videoUrl || null, // Solo se guarda si viene en el create
        },
      });
      upserted++;
    }

    return NextResponse.json({ ok: true, fetched: matches.length, upserted });
  } catch (error) {
    console.error("Error en cron sync-matches:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
