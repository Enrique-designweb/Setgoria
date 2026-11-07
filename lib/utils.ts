// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 1. Función para combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 2. Función para abreviar nombres de equipos
export function getTeamAbbreviation(name: string): string {
  if (!name) return "";
  
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

  if (name.length > 12) {
    const words = name.split(" ");
    if (words.length > 1) {
      return words.map(w => w[0]).join("").toUpperCase();
    }
    return name.substring(0, 10) + "...";
  }

  return name;
}

// 3. Función para validar el Carnet de Identidad Cubano y la edad
export function validateCubanCI(ci: string, providedBirthDate: string | Date): { isValid: boolean; message: string } {
  const cleanCI = ci.replace(/\D/g, "");
  
  if (cleanCI.length !== 11) {
    return { isValid: false, message: "El CI debe tener 11 dígitos." };
  }

  const yearStr = cleanCI.substring(0, 2);
  const monthStr = cleanCI.substring(2, 4);
  const dayStr = cleanCI.substring(4, 6);

  let year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const currentYear2Digits = new Date().getFullYear() % 100;
  if (year > currentYear2Digits) {
    year += 1900;
  } else {
    year += 2000;
  }

  const ciBirthDate = new Date(year, month - 1, day);
  const inputDate = new Date(providedBirthDate);
  
  if (ciBirthDate.getTime() !== inputDate.getTime()) {
    return { isValid: false, message: "La fecha de nacimiento no coincide con el Carnet de Identidad." };
  }

  const today = new Date();
  let age = today.getFullYear() - ciBirthDate.getFullYear();
  const m = today.getMonth() - ciBirthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < ciBirthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return { isValid: false, message: "Debes ser mayor de 18 años." };
  }

  return { isValid: true, message: "Verificado correctamente." };
}
