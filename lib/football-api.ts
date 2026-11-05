// lib/football-api.ts
import { unstable_cache } from "next/cache";

const BASE_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.FOOTBALL_API_KEY;

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: { long: string; short: string; elapsed: number | null };
  };
  league: { id: number; name: string; country: string; logo: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

interface ApiFootballResponse {
  response: ApiFootballFixture[];
  errors: unknown[];
}

export interface NormalizedMatch {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  sport: "FUTBOL";
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  homeLogo?: string;
  awayLogo?: string;
}

function normalizeFixture(f: ApiFootballFixture): NormalizedMatch {
  const short = f.fixture.status.short;
  const isLive = ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(short);
  const isFinished = ["FT", "AET", "PEN", "CANC"].includes(short);

  return {
    id: `fb-${f.fixture.id}`,
    league: `${f.league.country} · ${f.league.name}`,
    homeTeam: f.teams.home.name,
    awayTeam: f.teams.away.name,
    matchDate: f.fixture.date,
    sport: "FUTBOL",
    status: isLive ? "LIVE" : isFinished ? "FINISHED" : "SCHEDULED",
    homeLogo: f.teams.home.logo,
    awayLogo: f.teams.away.logo,
  };
}

async function fetchFromAPI(): Promise<NormalizedMatch[]> {
  if (!API_KEY) {
    console.warn("FOOTBALL_API_KEY no configurada, devolviendo []");
    return [];
  }

  const res = await fetch(
    `${BASE_URL}/fixtures?date=${new Date().toISOString().slice(0, 10)}&timezone=America/Havana`,
    {
      headers: { "x-apisports-key": API_KEY },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Football API error:", res.status, await res.text());
    return [];
  }

  const data: ApiFootballResponse = await res.json();
  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    console.error("Football API errors:", data.errors);
  }

  return data.response.map(normalizeFixture);
}

// ✅ Cache de 5 minutos
export const getFootballMatches = unstable_cache(
  async () => {
    try {
      return await fetchFromAPI();
    } catch (err) {
      console.error("Error fetching football API:", err);
      return [];
    }
  },
  ["football-matches-today"],
  { revalidate: 300, tags: ["football"] }
);
