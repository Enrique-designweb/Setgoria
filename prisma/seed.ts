// prisma/seed.ts
import { PrismaClient, Sport, MatchStatus } from '../src/generated/prisma/client'; // 👈 Importamos los Enums
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🏟️ Insertando los 8 partidos con 2 EN VIVO...');

  // 1. Limpiamos los partidos viejos
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();

  // Configuración de fechas
  const now = new Date();
  const todayAtHour = (hour: number) => {
    const d = new Date(now);
    d.setHours(hour, 0, 0, 0);
    if (d < now) d.setDate(d.getDate() + 1);
    return d;
  };

  const matchesData = [
    // --- PARTIDOS EN VIVO ---
    {
      league: 'Champions League',
      homeTeam: 'Real Madrid',
      awayTeam: 'AEK',
      matchDate: todayAtHour(18),
      sport: Sport.FUTBOL,
      status: MatchStatus.LIVE, // 👈 EN VIVO
      homeScore: 2,            // 👈 Goles Local
      awayScore: 1,            // 👈 Goles Visita
      elapsed: 67,             // 👈 Minuto
      predictions: [
        { type: 'Madrid +1.5 goles', probability: 91, isPremium: false },
        { type: 'Mbappé anota 1 gol', probability: 86, isPremium: true },
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'Arsenal',
      awayTeam: 'Slavia Praga',
      matchDate: todayAtHour(20),
      sport: Sport.FUTBOL,
      status: MatchStatus.LIVE, // 👈 EN VIVO
      homeScore: 1,            // 👈 Goles Local
      awayScore: 0,            // 👈 Goles Visita
      elapsed: 34,             // 👈 Minuto
      predictions: [
        { type: '+1.5 goles FT', probability: 84, isPremium: false },
      ]
    },
    // --- PARTIDOS NORMALES (NS = Not Started) ---
    {
      league: 'Inglaterra Championship',
      homeTeam: 'Cardiff',
      awayTeam: 'West Ham',
      matchDate: todayAtHour(15),
      sport: Sport.FUTBOL,
      status: MatchStatus.NS,
      predictions: [
        { type: '+1.5 goles FT', probability: 91, isPremium: false },
        { type: '+2.5 goles FT', probability: 76, isPremium: true },
        { type: 'Ambos anotan', probability: 76, isPremium: true },
        { type: 'Gana West Ham', probability: 62, isPremium: true },
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'Liverpool',
      awayTeam: 'Fenerbahce',
      matchDate: todayAtHour(18),
      sport: Sport.FUTBOL,
      status: MatchStatus.NS,
      predictions: [
        { type: 'Gana Liverpool', probability: 79, isPremium: true },
        { type: '+1.5 goles FT', probability: 86, isPremium: false },
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'RB Leipzig',
      awayTeam: 'Manchester City',
      matchDate: todayAtHour(20),
      sport: Sport.FUTBOL,
      status: MatchStatus.NS,
      predictions: [
        { type: 'Gana Manchester City', probability: 81, isPremium: true },
        { type: '+1.5 goles FT', probability: 85, isPremium: false },
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'Porto',
      awayTeam: 'Napoli',
      matchDate: todayAtHour(20),
      sport: Sport.FUTBOL,
      status: MatchStatus.NS,
      predictions: [
        { type: 'Menos de 4.5 goles FT', probability: 76, isPremium: true },
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'PSV',
      awayTeam: 'Brujas',
      matchDate: todayAtHour(15),
      sport: Sport.FUTBOL,
      status: MatchStatus.NS,
      predictions: [
        { type: 'Ambos anotan (Sí)', probability: 81, isPremium: true },
      ]
    },
    {
      league: 'Brasil Serie A',
      homeTeam: 'Flamengo',
      awayTeam: 'Gremio',
      matchDate: todayAtHour(21),
      sport: Sport.FUTBOL,
      status: MatchStatus.NS,
      predictions: [
        { type: 'Menos de 3.5 goles FT', probability: 79, isPremium: true },
        { type: 'Gana Flamengo', probability: 87, isPremium: true },
      ]
    },
  ];

  for (const match of matchesData) {
    await prisma.match.create({
      data: {
        league: match.league,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        matchDate: match.matchDate,
        sport: match.sport,
        status: match.status,
        homeScore: match.homeScore || null,
        awayScore: match.awayScore || null,
        elapsed: match.elapsed || null,
        predictions: {
          create: match.predictions,
        },
      },
    });
  }

  console.log('✅ ¡8 partidos insertados (2 en vivo)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
