// app/(dashboard)/pronosticos/page.tsx
import { prisma } from "@/lib/prisma";
import MatchCard from "@/components/ui/MatchCard";
import { auth } from "@/auth";
import { Target } from "lucide-react";

export default async function PronosticosPage() {
  const session = await auth();
  
  const matches = await prisma.match.findMany({
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
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-white">
      <div className="flex items-center gap-3 mb-8">
        <Target className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-black italic text-orange-500 uppercase">Todos los Pronósticos</h1>
          <p className="text-sm text-gray-400 mt-1">Análisis avanzado de todos los partidos disponibles.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} hasActiveSubscription={hasActiveSubscription} />
        ))}
      </div>
    </div>
  );
}
