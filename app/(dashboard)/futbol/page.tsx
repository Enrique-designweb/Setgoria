// app/(dashboard)/futbol/page.tsx
import { prisma } from "@/lib/prisma";
import { getFootballMatches } from "@/lib/football-api";
import LiveMatches from "@/components/ui/LiveMatches";
import MatchAccordion from "@/components/ui/MatchAccordion";
import type { OfflineMatch } from "@/lib/offline-db";
import { auth } from "@/auth";
import { GenericMatch } from "@/components/ui/MatchCard"; // 👈 Importamos el tipo

export const revalidate = 300; 

export default async function FutbolPage() {
  const session = await auth();
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
      status: m.status as "NS" | "LIVE" | "HT" | "FT" | "CANC",
    }));
  }

  const live = matches.filter((m) => m.status === "LIVE" || m.status === "HT");
  const upcoming = matches.filter((m) => m.status !== "LIVE" && m.status !== "HT").slice(0, 30);

  let hasActiveSubscription = false;
  if (session?.user?.id) {
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE", expiresAt: { gt: new Date() } }
    });
    if (activeSub) hasActiveSubscription = true;
  }

  return (
    <div className="p-4 md:p-6 pb-24">
      <h1 className="text-2xl font-black italic text-orange-500 uppercase mb-4">Fútbol</h1>
      
      {live.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> En Vivo
          </h2>
          <LiveMatches matches={live} />
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase">Próximos Partidos</h2>
        <div className="flex flex-col gap-3">
          {upcoming.map((match) => (
            <MatchAccordion 
              key={match.id} 
              // 👇 SOLUCIÓN AL 'ANY': Casteamos a 'unknown' y luego a 'GenericMatch'
              match={match as unknown as GenericMatch} 
              hasActiveSubscription={hasActiveSubscription} 
              isAdmin={session?.user?.role === "ADMIN"} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
