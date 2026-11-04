// components/ui/MatchCard.tsx
import { Match, Prediction } from '../../src/generated/prisma/client';
import { Lock, Crown } from 'lucide-react';
import Link from 'next/link';

type MatchWithPredictions = Match & { predictions: Prediction[] };

export default function MatchCard({ match, hasActiveSubscription }: { match: MatchWithPredictions, hasActiveSubscription: boolean }) {
  const matchDate = new Date(match.matchDate).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Colores según el deporte
  const sportColors = {
    FUTBOL: 'bg-green-500/10 text-green-500 border-green-500/20',
    TENIS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    BASQUETBOL: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  };

  const currentSportColor = sportColors[match.sport as keyof typeof sportColors] || sportColors.FUTBOL;

  return (
    <div className="bg-set-surface border border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-xl transition-all hover:border-gray-700">
      
      {/* Header: Liga, Deporte y Hora */}
      <div className="flex justify-between text-[11px] text-gray-400 mb-5 font-bold tracking-wider">
        <div className="flex items-center gap-2">
          {/* 👈 Badge del Deporte */}
          <span className={`px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider ${currentSportColor}`}>
            {match.sport}
          </span>
          <span>{match.league.toUpperCase()}</span>
        </div>
        <span>HOY, {matchDate}</span>
      </div>
      
      {/* Equipos */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold text-lg text-white w-1/3">{match.homeTeam}</h3>
        <span className="text-red-500 font-black italic text-sm px-4">VS</span>
        <h3 className="font-bold text-lg text-white text-right w-1/3">{match.awayTeam}</h3>
      </div>

      {/* Predicciones (Lógica Premium) */}
      <div className="flex flex-col gap-5">
        {match.predictions.map((pred) => {
          const isLocked = pred.isPremium && !hasActiveSubscription;

          return (
            <div key={pred.id} className="flex flex-col gap-2 relative">
              <div className="flex justify-between text-[13px] font-semibold text-gray-300">
                <span className="flex items-center gap-2">
                  {pred.type}
                  {pred.isPremium && <Crown className="w-3.5 h-3.5 text-orange-500" />}
                </span>
                {!isLocked && (
                  <span className={pred.probability > 50 ? 'text-cyan-400' : 'text-orange-500'}>
                    {pred.probability}%
                  </span>
                )}
              </div>
              
              {isLocked ? (
                <Link href="/suscripcion" className="w-full bg-[#090a0e] border border-orange-500/30 rounded-lg p-3 flex items-center justify-between group hover:bg-orange-500/5 transition-colors cursor-pointer">
                  <span className="text-xs text-gray-400 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-orange-500" /> Pronóstico exclusivo Premium
                  </span>
                  <span className="text-xs font-bold text-orange-500 group-hover:underline">
                    Desbloquear
                  </span>
                </Link>
              ) : (
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full ${
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
