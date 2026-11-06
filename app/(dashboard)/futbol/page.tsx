import { prisma } from "@/lib/prisma";
import { getFootballMatches } from "@/lib/football-api";
import LiveMatches from "@/components/ui/LiveMatches";
import FutbolClient from "./FutbolClient";
import type { OfflineMatch } from "@/lib/offline-db";

export const revalidate = 300; 

export default async function FutbolPage() {
  let matches: OfflineMatch[] = [];

  try {
    const apiMatches = await getFootballMatches();
    if (apiMatches.length > 0) {
      matches = apiMatches.map((m) => ({
        id: m.id,
        league: m.league,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        matchDate: m.matchDate,
        sport: "FUTBOL",
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        elapsed: m.elapsed,
        predictions: [],
      }));
    }
  } catch {
    console.warn("API fútbol no disponible, usando BD");
  }

  if (matches.length === 0) {
    const dbMatches = await prisma.match.findMany({
      where: { sport: "FUTBOL" },
      include: { predictions: true },
      orderBy: { matchDate: "asc" },
      take: 50,
    });
    
    matches = dbMatches.map((m) => ({
      ...m,
      matchDate: m.matchDate.toISOString(),
      status: m.status as "NS" | "LIVE" | "HT" | "FT" | "CANC", // 👈 Casteo seguro
    }));
  }

  const live = matches.filter((m) => m.status === "LIVE" || m.status === "HT");

  return (
    <div className="p-4 md:p-6 pb-24">
      <h1 className="text-2xl font-black italic text-orange-500 uppercase mb-4">Fútbol</h1>
      {live.length > 0 && <LiveMatches matches={live} />}
      <FutbolClient matches={matches} /> 
    </div>
  );
}
