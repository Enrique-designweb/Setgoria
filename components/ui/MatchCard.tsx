import { Lock, Crown, PlayCircle, Trophy, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { getTeamAbbreviation } from '@/lib/utils';
import LiveVideoPlayer from './LiveVideoPlayer';

export interface GenericMatch {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string | Date;
  sport: string; 
  videoUrl?: string | null;
  predictions: {
    id: string;
    type: string;
    probability: number;
    isPremium: boolean;
    result?: "WON" | "LOST" | "PENDING" | null;
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

  const homeTeamShort = getTeamAbbreviation(match.homeTeam);
  const awayTeamShort = getTeamAbbreviation(match.awayTeam);

  return (
    <div className="bg-set-surface border border-gray-800 rounded-2xl p-4 w-full max-w-full shadow-xl transition-all hover:border-gray-700 overflow-hidden">
      
      {/* Cabecera */}
      <div className="flex justify-between text-[10px] text-gray-400 mb-4 font-bold tracking-wider gap-2">
        <span className="truncate">{match.league.toUpperCase()}</span>
        <span className="shrink-0">HOY, {matchDate}</span>
      </div>
      
      {/* Equipos */}
      <div className="flex justify-between items-center mb-6 gap-2">
        <div className="flex-1 min-w-0 text-left">
          <h3 className="font-bold text-sm sm:text-base text-white truncate" title={match.homeTeam}>
            {homeTeamShort}
          </h3>
        </div>
        <span className="text-red-500 font-black italic text-xs px-2 shrink-0">VS</span>
        <div className="flex-1 min-w-0 text-right">
          <h3 className="font-bold text-sm sm:text-base text-white truncate" title={match.awayTeam}>
            {awayTeamShort}
          </h3>
        </div>
      </div>

      {/* Pronósticos con Historial (WON/LOST) */}
      <div className="flex flex-col gap-4 w-full">
        {match.predictions.map((pred) => {
          const isLocked = pred.isPremium && !hasActiveSubscription && !isAdmin;

          return (
            <div key={pred.id} className="flex flex-col gap-1.5 relative w-full">
              <div className="flex justify-between items-center text-[11px] sm:text-[13px] font-semibold text-gray-300 gap-2 w-full">
                <span className="flex items-center gap-1 min-w-0">
                  <span className="truncate">{pred.type}</span>
                  {pred.isPremium && <Crown className="w-3.5 h-3.5 text-orange-500 shrink-0" aria-label="Premium" />}
                  
                  {/* 👇 SOLUCIÓN: Envolvemos en un span con title */}
                  {pred.result === "WON" && <span title="Ganado"><Trophy className="w-3.5 h-3.5 text-green-500 shrink-0 ml-1" /></span>}
                  {pred.result === "LOST" && <span title="Perdido"><XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 ml-1" /></span>}
                  {pred.result === "PENDING" && <span title="Pendiente"><Clock className="w-3.5 h-3.5 text-gray-500 shrink-0 ml-1" /></span>}
                </span>
                
                {!isLocked && (
                  <span className={`shrink-0 ${pred.probability > 50 ? 'text-cyan-400' : 'text-orange-500'}`}>
                    {pred.probability}%
                  </span>
                )}
              </div>
              
              {isLocked ? (
                <Link href="/suscripcion" className="w-full bg-[#090a0e] border border-orange-500/30 rounded-lg p-2.5 flex items-center justify-between group hover:bg-orange-500/5 transition-colors cursor-pointer">
                  <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5 truncate mr-2">
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

      {/* Reproductor de Video Integrado */}
      {match.videoUrl ? (
        <div className="mt-5 border-t border-gray-800/50 pt-4">
          <LiveVideoPlayer videoUrl={match.videoUrl} />
        </div>
      ) : (
        <div className="mt-5 border-t border-gray-800/50 pt-4">
          <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-800/50 text-gray-500 border border-gray-800 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed">
            <PlayCircle className="w-4 h-4" /> Transmisión no disponible
          </button>
        </div>
      )}
    </div>
  );
}
