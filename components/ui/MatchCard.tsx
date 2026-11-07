// components/ui/MatchCard.tsx
import { Lock, Crown } from 'lucide-react';
import Link from 'next/link';

export interface GenericMatch {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string | Date;
  sport: string; 
  predictions: {
    id: string;
    type: string;
    probability: number;
    isPremium: boolean;
  }[];
}

export default function MatchCard({ 
  match, 
  hasActiveSubscription, 
  isAdmin 
}: { 
  match: GenericMatch; 
  hasActiveSubscription: boolean; 
  isAdmin?: boolean;
}) {
  const safeDate = typeof match.matchDate === "string" ? new Date(match.matchDate) : match.matchDate;
  const matchDate = safeDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    // 👈 w-full max-w-full para que nunca se salga de la pantalla
    <div className="bg-set-surface border border-gray-800 rounded-2xl p-4 w-full max-w-full shadow-xl transition-all hover:border-gray-700 overflow-hidden">
      
      <div className="flex justify-between text-[10px] text-gray-400 mb-4 font-bold tracking-wider">
        <span className="truncate pr-2">{match.league.toUpperCase()}</span>
        <span className="shrink-0">HOY, {matchDate}</span>
      </div>
      
      <div className="flex justify-between items-center mb-6 gap-2">
        {/* 👈 Añadimos min-w-0 y truncate a los equipos */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-white truncate">{match.homeTeam}</h3>
        </div>
        <span className="text-red-500 font-black italic text-xs px-2 shrink-0">VS</span>
        <div className="flex-1 min-w-0 text-right">
          <h3 className="font-bold text-sm sm:text-base text-white truncate">{match.awayTeam}</h3>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {match.predictions.map((pred) => {
          const isLocked = pred.isPremium && !hasActiveSubscription && !isAdmin;

          return (
            <div key={pred.id} className="flex flex-col gap-1.5 relative w-full">
              <div className="flex justify-between items-center text-[11px] sm:text-[13px] font-semibold text-gray-300 gap-2">
                <span className="flex items-center gap-1 min-w-0">
                  <span className="truncate">{pred.type}</span>
                  {pred.isPremium && <Crown className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                </span>
                {!isLocked && (
                  <span className={`shrink-0 ${pred.probability > 50 ? 'text-cyan-400' : 'text-orange-500'}`}>
                    {pred.probability}%
                  </span>
                )}
              </div>
              
              {isLocked ? (
                // 👈 El link de desbloqueo ahora se ajusta al 100%
                <Link href="/suscripcion" className="w-full bg-[#090a0e] border border-orange-500/30 rounded-lg p-2.5 flex items-center justify-between group hover:bg-orange-500/5 transition-colors cursor-pointer">
                  <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5 truncate">
                    <Lock className="w-3.5 h-3.5 text-orange-500 shrink-0" /> <span className="truncate">Exclusivo Premium</span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-orange-500 group-hover:underline shrink-0">
                    Desbloquear
                  </span>
                </Link>
              ) : (
                <div className="w-full bg-gray-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      pred.probability > 50 
                        ? 'bg-linear-to-r from-cyan-500 to-blue-500' 
                        : 'bg-linear-to-r from-orange-500 to-red-500'
                    }`}
                    style={{ width: `${pred.probability}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
