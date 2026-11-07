// components/ui/MatchAccordion.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import MatchCard, { GenericMatch } from "./MatchCard";
import { getTeamAbbreviation } from "@/lib/utils";

interface Props {
  match: GenericMatch; // 👈 Tipado estricto, sin 'any'
  hasActiveSubscription: boolean;
  isAdmin?: boolean;
}

export default function MatchAccordion({ match, hasActiveSubscription, isAdmin }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const homeShort = getTeamAbbreviation(match.homeTeam);
  const awayShort = getTeamAbbreviation(match.awayTeam);
  
  const matchDate = new Date(match.matchDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-set-surface border border-gray-800 rounded-xl overflow-hidden transition-all duration-300">
      {/* Cabecera del Acordeón (Siempre visible) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 w-full">
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase truncate w-full text-left">
              {match.league} · {matchDate}
            </span>
            <div className="flex items-center gap-2 mt-1 w-full">
              <span className="text-sm font-bold text-white truncate">{homeShort}</span>
              <span className="text-xs text-orange-500 font-black">VS</span>
              <span className="text-sm font-bold text-white truncate">{awayShort}</span>
            </div>
          </div>
          <div className="shrink-0 bg-orange-500/10 p-2 rounded-lg">
            <ChevronDown className={`w-5 h-5 text-orange-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {/* Contenido Desplegable (El MatchCard completo) */}
      {isOpen && (
        <div className="p-4 border-t border-gray-800/50 bg-set-bg">
          <MatchCard 
            match={match} 
            hasActiveSubscription={hasActiveSubscription} 
            isAdmin={isAdmin} 
          />
        </div>
      )}
    </div>
  );
}
