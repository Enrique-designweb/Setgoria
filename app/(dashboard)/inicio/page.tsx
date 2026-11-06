// app/(dashboard)/page.tsx
import { prisma } from "@/lib/prisma";
import MatchCard from "@/components/ui/MatchCard";
import { auth } from "@/auth";
import StoriesBar from "@/components/ui/StoriesBar";
import LiveMatches from "@/components/ui/LiveMatches";
import { OfflineMatch } from "@/lib/offline-db"; // 👈 Importamos el tipo correcto

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  const matches = await prisma.match.findMany({
    include: { predictions: true },
    orderBy: { matchDate: 'asc' },
    take: 3
  });

  // 👈 Buscamos los partidos en VIVO
  const dbLiveMatches = await prisma.match.findMany({
    where: { status: "LIVE" },
    include: { predictions: true },
  });

  // 👈 Convertimos las fechas de Date a String para que coincidan con OfflineMatch
  const liveMatches: OfflineMatch[] = dbLiveMatches.map((m) => ({
    id: m.id,
    league: m.league,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    matchDate: m.matchDate.toISOString(),
    sport: m.sport,
    status: m.status as "NS" | "LIVE" | "HT" | "FT" | "CANC",
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    elapsed: m.elapsed,
    predictions: m.predictions,
  }));

  let hasActiveSubscription = false;
  if (session?.user?.id) {
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE", expiresAt: { gt: new Date() } }
    });
    if (activeSub) hasActiveSubscription = true;
  }

  return (
    <main className="p-4 md:p-10 min-h-screen bg-[#090a0e] text-white">
      <div className="max-w-4xl mx-auto">
        <StoriesBar />
        
        {/* 👈 Le pasamos los partidos mapeados sin el "any" */}
        <LiveMatches matches={liveMatches} />
        
        <h1 className="text-3xl md:text-4xl font-black mb-8 text-orange-500 uppercase italic tracking-tight mt-6">
          Pronósticos Destacados
        </h1>
        <div className="flex flex-col gap-6">
          {matches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              hasActiveSubscription={hasActiveSubscription} 
              isAdmin={session?.user?.role === "ADMIN"} 
            />
          ))}
        </div>
      </div>
    </main>
  );
}
