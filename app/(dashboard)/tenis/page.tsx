// app/(dashboard)/tenis/page.tsx
import { prisma } from "@/lib/prisma";
import MatchCard from "@/components/ui/MatchCard";
import { auth } from "@/auth";
import { Trophy } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TenisPage() {
  const session = await auth();
  
  const matches = await prisma.match.findMany({
    where: { sport: "TENIS" },
    include: { predictions: true },
    orderBy: { matchDate: 'asc' }
  });

  let hasActiveSubscription = false;
  if (session?.user?.id) {
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE", expiresAt: { gt: new Date() } }
    });
    if (activeSub) hasActiveSubscription = true;
  }

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto text-white">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-orange-500" />
        <h1 className="text-2xl md:text-3xl font-black italic text-orange-500 uppercase">Partidos de Tenis</h1>
      </div>
      
      {matches.length === 0 ? (
        <p className="text-gray-400">No hay partidos programados.</p>
      ) : (
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
      )}
    </div>
  );
}
