import { Radio } from "lucide-react";
import { OfflineMatch } from "@/lib/offline-db";

interface LiveMatchesProps {
  matches: OfflineMatch[];
}

export default function LiveMatches({ matches }: LiveMatchesProps) {
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
        {matches.map((match) => (
          <div key={match.id} className="min-w-70 bg-[#14161d] border border-red-500/30 rounded-xl p-4 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {match.status === 'HT' ? 'Descanso' : match.elapsed ? `${match.elapsed}'` : 'EN VIVO'}
            </div>

            <p className="text-[10px] text-gray-400 font-bold uppercase mb-3 truncate pr-12">
              {match.league}
            </p>

            <div className="flex justify-between items-center mb-2">
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-white text-center leading-tight line-clamp-1">{match.homeTeam}</span>
              </div>

              <div className="flex items-center gap-2 px-3">
                <span className="text-2xl font-black text-white">{match.homeScore ?? 0}</span>
                <span className="text-gray-500 font-bold">-</span>
                <span className="text-2xl font-black text-white">{match.awayScore ?? 0}</span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-white text-center leading-tight line-clamp-1">{match.awayTeam}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
