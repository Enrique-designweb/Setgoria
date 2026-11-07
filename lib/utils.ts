// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 👇 Función para combinar clases de Tailwind (La que faltaba)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 👇 Función para abreviar nombres de equipos
export function getTeamAbbreviation(name: string): string {
  if (!name) return "";
  
  // Diccionario de equipos famosos
  const knownTeams: Record<string, string> = {
    "Paris Saint-Germain": "PSG",
    "Manchester City": "Man City",
    "Manchester United": "Man Utd",
    "Borussia Mönchengladbach": "M'gladbach",
    "Wolverhampton Wanderers": "Wolves",
    "Atletico Madrid": "Atleti",
    "Inter de Milan": "Inter",
    "AC Milan": "Milan",
    "Bayern Munich": "Bayern",
    "Bayer Leverkusen": "Leverkusen",
    "Eintracht Frankfurt": "Frankfurt",
    "Real Betis": "Betis",
    "Real Sociedad": "Real Sociedad",
  };

  if (knownTeams[name]) return knownTeams[name];

  // Si no está en la lista y es un nombre largo (más de 12 letras)
  if (name.length > 12) {
    const words = name.split(" ");
    if (words.length > 1) {
      return words.map(w => w[0]).join("").toUpperCase();
    }
    return name.substring(0, 10) + "...";
  }

  return name;
}
