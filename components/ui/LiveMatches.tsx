// components/ui/LiveMatches.tsx
import { Radio } from "lucide-react";

const LIVE_MATCHES = [
  { id: 1, home: "Real Madrid", away: "Barcelona", score: "2 - 1", minute: "75'" },
  { id: 2, home: "Man City", away: "Liverpool", score: "0 - 0", minute: "32'" },
];

export default function LiveMatches() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-red-500/20 p-1.5 rounded-lg">
          <Radio className="w-5 h-5 text-red-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white">En Vivo</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {LIVE_MATCHES.map((match) => (
          <div key={match.id} className="min-w-70 bg-[#14161d] border border-red-500/30 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
              {match.minute}
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-white">{match.home}</span>
              <span className="text-lg font-black text-orange-500">{match.score}</span>
              <span className="text-sm font-bold text-white">{match.away}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">Liga Española</p>
          </div>
        ))}
      </div>
    </div>
  );
}
