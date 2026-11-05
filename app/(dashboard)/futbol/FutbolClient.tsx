"use client";

import React, { useEffect, useState } from "react";
import MatchCard, { GenericMatch } from "@/components/ui/MatchCard";
import { saveMatchesOffline, getMatchesOffline, type OfflineMatch } from "@/lib/offline-db";

// 👈 Tipado explícito
interface FutbolClientProps {
  matches: OfflineMatch[];
  hasActiveSubscription?: boolean;
  isAdmin?: boolean;
}

export default function FutbolClient({ 
  matches, 
  hasActiveSubscription = false, 
  isAdmin = false 
}: FutbolClientProps) {
  const [data, setData] = useState<OfflineMatch[]>(matches);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (matches.length > 0) {
      saveMatchesOffline(matches).catch((err) => console.error("Error guardando offline:", err));
    }
  }, [matches]);

  useEffect(() => {
    const handleOffline = async () => {
      setOffline(true);
      try {
        const cached = await getMatchesOffline();
        if (cached.length > 0) setData(cached);
      } catch (err) {
        console.error("Error leyendo offline:", err);
      }
    };
    const handleOnline = () => {
      setOffline(false);
      setData(matches);
    };

    if (!navigator.onLine) handleOffline();

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [matches]);

  return (
    <>
      {offline && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold p-3 rounded-lg mb-4">
          📡 Modo offline — mostrando datos en caché
        </div>
      )}

      <div className="flex flex-col gap-4">
        {data.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No hay partidos disponibles</div>
        ) : (
          data.map((m) => (
            <MatchCard
              key={m.id}
              match={m as unknown as GenericMatch} // 👈 Casteo seguro
              hasActiveSubscription={hasActiveSubscription}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </>
  );
}
