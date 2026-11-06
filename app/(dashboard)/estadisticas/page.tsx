// app/(dashboard)/estadisticas/page.tsx
import { prisma } from "@/lib/prisma";
import { Target, TrendingUp, ShieldCheck } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function EstadisticasPage() {
  const predictions = await prisma.prediction.findMany({
    where: { result: { not: "PENDING" } },
    include: { match: true },
    orderBy: { match: { matchDate: 'desc' } },
    take: 50
  });

  const total = predictions.length;
  const won = predictions.filter(p => p.result === "WON").length;
  const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto pb-24 text-white">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-500/20 p-2 rounded-lg">
          <TrendingUp className="text-orange-500 w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight">Nuestro Historial</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#14161d] border border-gray-800 p-6 rounded-2xl flex flex-col items-center text-center">
          <Target className="w-8 h-8 text-blue-400 mb-2" />
          <span className="text-3xl font-black">{total}</span>
          <span className="text-xs text-gray-400 uppercase font-bold mt-1">Pronósticos Cerrados</span>
        </div>
        <div className="bg-[#14161d] border border-gray-800 p-6 rounded-2xl flex flex-col items-center text-center">
          <ShieldCheck className="w-8 h-8 text-green-400 mb-2" />
          <span className="text-3xl font-black text-green-400">{won}</span>
          <span className="text-xs text-gray-400 uppercase font-bold mt-1">Acertados</span>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-2xl flex flex-col items-center text-center">
          <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
          <span className="text-3xl font-black text-orange-500">{winRate}%</span>
          <span className="text-xs text-orange-500/70 uppercase font-bold mt-1">Efectividad</span>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Últimos Resultados</h2>
      <div className="flex flex-col gap-3">
        {predictions.map((pred) => (
          <div key={pred.id} className="bg-[#14161d] border border-gray-800 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">{pred.match.league}</p>
              <p className="text-sm font-bold mt-1">{pred.match.homeTeam} vs {pred.match.awayTeam}</p>
              <p className="text-xs text-gray-300 mt-1">{pred.type}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              pred.result === "WON" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
            }`}>
              {pred.result === "WON" ? "ACERTADO" : "FALLADO"}
            </span>
          </div>
        ))}
        {predictions.length === 0 && <p className="text-gray-500 text-sm">Aún no hay resultados registrados.</p>}
      </div>
    </div>
  );
}
