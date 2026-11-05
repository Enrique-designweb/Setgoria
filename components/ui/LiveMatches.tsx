// components/ui/LiveMatches.tsx
import { Radio } from "lucide-react";
import { OfflineMatch } from "@/lib/offline-db"; // 👈 Importamos el tipo

// 1. Definimos la interfaz de las props
interface LiveMatchesProps {
  matches: OfflineMatch[];
}

// 2. Recibimos "matches" como prop
export default function LiveMatches({ matches }: LiveMatchesProps) {
  // Si no hay partidos en vivo, no mostramos nada
  if (!matches || matches.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-red-500/20 p-1.5 rounded-lg">
          <Radio className="w-5 h-5 text-red-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white">En Vivo</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {/* 3. Mapeamos los partidos reales */}
        {matches.map((match) => (
          <div key={match.id} className="min-w-70 bg-[#14161d] border border-red-500/30 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
              EN VIVO
            </div>
            
            <div className="flex justify-between items-center mb-2 mt-2">
              <span className="text-sm font-bold text-white w-1/3 truncate">{match.homeTeam}</span>
              
              {/* Marcador temporal (puedes conectarlo a tu API de resultados luego) */}
              <span className="text-lg font-black text-orange-500 px-2">- : -</span>
              
              <span className="text-sm font-bold text-white text-right w-1/3 truncate">{match.awayTeam}</span>
            </div>
            
            <p className="text-xs text-gray-400 text-center truncate">{match.league}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
