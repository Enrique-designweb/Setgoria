// lib/football-api.ts
import { unstable_cache } from "next/cache";
import { fetchFromFootballData, NormalizedMatch } from "./football-data";

const BASE_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.FOOTBALL_API_KEY;

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
  };
  league: { name: string; country: string };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  goals: { home: number | null; away: number | null };
}

interface ApiFootballResponse {
  response: ApiFootballFixture[];
}

async function fetchFromAPIFootball(): Promise<NormalizedMatch[]> {
  if (!API_KEY) return [];

  const res = await fetch(
    `${BASE_URL}/fixtures?date=${new Date().toISOString().slice(0, 10)}&timezone=America/Havana`,
    { headers: { "x-apisports-key": API_KEY }, cache: "no-store" }
  );

  if (!res.ok) return [];
  
  const data: ApiFootballResponse = await res.json();
  
  return data.response.map((f) => {
    const short = f.fixture.status.short;
    let status: "NS" | "LIVE" | "HT" | "FT" | "CANC" = "NS";
    
    if (["1H", "2H", "ET", "P", "LIVE"].includes(short)) status = "LIVE";
    else if (short === "HT") status = "HT";
    else if (["FT", "AET", "PEN"].includes(short)) status = "FT";
    else if (short === "CANC") status = "CANC";

    return {
      id: `fb-${f.fixture.id}`,
      league: `${f.league.country} · ${f.league.name}`,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      matchDate: f.fixture.date,
      sport: "FUTBOL",
      status,
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      elapsed: f.fixture.status.elapsed,
      videoUrl: null,
    };
  });
}

// 👇 EL SISTEMA HÍBRIDO
export const getFootballMatches = unstable_cache(
  async () => {
    try {
      // 1. Intentamos con Football-Data (Mayor cuota diaria)
      console.log("⏳ Consultando Football-Data.org...");
      const primaryMatches = await fetchFromFootballData();
      
      if (primaryMatches.length > 0) {
        console.log("✅ Datos obtenidos de Football-Data.org");
        return primaryMatches;
      }

      // 2. Si falla o no hay partidos hoy, usamos API-Football
      console.log("⚠️ Football-Data vacío o falló. Consultando API-Football...");
      const backupMatches = await fetchFromAPIFootball();
      return backupMatches;

    } catch (err) {
      console.error("Error general en getFootballMatches:", err);
      return [];
    }
  },
  ["football-matches-hybrid"],
  { revalidate: 600, tags: ["football"] } // 10 minutos de caché
);
