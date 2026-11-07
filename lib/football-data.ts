// lib/football-data.ts

const BASE_URL = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

export interface NormalizedMatch {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  sport: "FUTBOL";
  status: "NS" | "LIVE" | "HT" | "FT" | "CANC";
  homeScore: number | null;
  awayScore: number | null;
  elapsed: number | null;
  videoUrl?: string | null;
}

// 👇 SOLUCIÓN: Tipado estricto para la respuesta de la API
interface FootballDataMatch {
  id: number;
  competition: { name: string };
  homeTeam: { name: string };
  awayTeam: { name: string };
  utcDate: string;
  status: string;
  score: { fullTime: { home: number | null; away: number | null } };
  minute: number | null;
}

interface FootballDataResponse {
  matches: FootballDataMatch[];
}

export async function fetchFromFootballData(): Promise<NormalizedMatch[]> {
  if (!API_KEY) {
    console.warn("FOOTBALL_DATA_API_KEY no configurada, saltando a respaldo...");
    return [];
  }

  const today = new Date().toISOString().split("T")[0];
  
  try {
    const res = await fetch(
      `${BASE_URL}/matches?dateFrom=${today}&dateTo=${today}`,
      { headers: { "X-Auth-Token": API_KEY }, cache: "no-store" }
    );

    if (!res.ok) return [];
    
    const data: FootballDataResponse = await res.json();
    
    return data.matches.map((m) => {
      let status: "NS" | "LIVE" | "HT" | "FT" | "CANC" = "NS";
      if (["IN_PLAY", "LIVE"].includes(m.status)) status = "LIVE";
      if (m.status === "PAUSED") status = "HT";
      if (m.status === "FINISHED") status = "FT";
      if (["SUSPENDED", "CANCELLED"].includes(m.status)) status = "CANC";

      return {
        id: `fd-${m.id}`, 
        league: m.competition.name,
        homeTeam: m.homeTeam.name || "TBD",
        awayTeam: m.awayTeam.name || "TBD",
        matchDate: m.utcDate,
        sport: "FUTBOL",
        status,
        homeScore: m.score.fullTime.home,
        awayScore: m.score.fullTime.away,
        elapsed: m.minute || null,
        videoUrl: null,
      };
    });
  } catch (error) {
    console.error("Error en Football-Data:", error);
    return [];
  }
}
