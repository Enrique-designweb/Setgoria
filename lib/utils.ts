// lib/utils.ts

export function getTeamAbbreviation(name: string): string {
  if (!name) return "";
  
  // 1. Diccionario de equipos famosos (Los abrevia a la perfección)
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

  // Si el equipo está en la lista, devolvemos su abreviatura oficial
  if (knownTeams[name]) return knownTeams[name];

  // 2. Si no está en la lista y es un nombre largo (más de 12 letras)
  if (name.length > 12) {
    const words = name.split(" ");
    // Si tiene 2 o más palabras, usamos las iniciales (Ej: "FC Barcelona" -> "FCB")
    if (words.length > 1) {
      return words.map(w => w[0]).join("").toUpperCase();
    }
    // Si es una sola palabra muy larga, la recortamos
    return name.substring(0, 10) + "...";
  }

  // 3. Si es un nombre corto (Ej: "Real Madrid"), lo dejamos igual
  return name;
}

