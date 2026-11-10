// app/(dashboard)/inicio/page.tsx
import { prisma } from "@/lib/prisma";
import MatchCard from "@/components/ui/MatchCard";
import { auth } from "@/auth";
import StoriesBar, { StoryData } from "@/components/ui/StoriesBar";
import LiveMatches from "@/components/ui/LiveMatches";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OfflineMatch } from "@/lib/offline-db";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  // 👇 1. Obtener Historias VÁLIDAS (Creadas hace menos de 24h)
  const now = new Date();
  const dbStories = await prisma.story.findMany({
    where: {
      expiresAt: { gt: now } 
    },
    orderBy: { createdAt: 'desc' },
    take: 10 
  });

  const stories: StoryData[] = dbStories.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description, // 👈 AÑADIDO AQUÍ
    imageUrl: s.imageUrl,
    videoUrl: s.videoUrl
  }));

  // 👇 2. Obtener Partidos Destacados
  const matches = await prisma.match.findMany({
    include: { predictions: true },
    orderBy: { matchDate: 'asc' },
    take: 3 
  });

  const liveMatchesRaw = await prisma.match.findMany({
    where: { status: "LIVE" },
    include: { predictions: true },
  });

  const liveMatches: OfflineMatch[] = liveMatchesRaw.map((m) => ({
    id: m.id, league: m.league, homeTeam: m.homeTeam, awayTeam: m.awayTeam,
    matchDate: m.matchDate.toISOString(), sport: m.sport,
    status: m.status as "NS" | "LIVE" | "HT" | "FT" | "CANC",
    homeScore: m.homeScore, awayScore: m.awayScore, elapsed: m.elapsed,
    predictions: m.predictions,
  }));

  // 👇 3. Verificar Suscripción
  let hasActiveSubscription = false;
  if (session?.user?.id) {
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE", expiresAt: { gt: new Date() } }
    });
    if (activeSub) hasActiveSubscription = true;
  }

  return (
    <main className="p-4 md:p-10 min-h-screen bg-set-bg text-white w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* 👇 Renderizamos las historias dinámicas */}
        <StoriesBar stories={stories} />
        
        <LiveMatches matches={liveMatches} />
        
        <div className="flex items-center justify-between mt-8 mb-4">
          <h1 className="text-2xl md:text-4xl font-black text-orange-500 uppercase italic tracking-tight">
            Destacados
          </h1>
          <Link href="/futbol" className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white transition-colors bg-gray-800/50 px-3 py-1.5 rounded-lg active:scale-95 shrink-0">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-col gap-6 w-full">
          {matches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              hasActiveSubscription={hasActiveSubscription} 
              isAdmin={session?.user?.role === "ADMIN"} 
            />
          ))}
        </div>
        
        <Link href="/futbol" className="mt-8 block text-center bg-[#1A1D24] border border-gray-800 hover:border-orange-500/50 text-white font-bold py-4 rounded-xl transition-all active:scale-95 w-full">
          Explorar todos los partidos
        </Link>
      </div>
    </main>
  );
}
