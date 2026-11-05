// app/(dashboard)/page.tsx
import { prisma } from "@/lib/prisma";
import MatchCard from "@/components/ui/MatchCard";
import { auth } from "@/auth";
import StoriesBar from "@/components/ui/StoriesBar";
import LiveMatches from "@/components/ui/LiveMatches";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  const matches = await prisma.match.findMany({
    include: { predictions: true },
    orderBy: { matchDate: 'asc' },
    take: 3
  });

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
        
        {/* 👈 ARREGLO: Pasamos un array vacío para que TypeScript sea feliz y no se muestre nada */}
        <LiveMatches matches={[]} />
        
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
