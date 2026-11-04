// prisma/seed-real.ts
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🏟️ Insertando datos reales de SETGORIA...');

  // 1. Limpiamos los partidos viejos (los de prueba)
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();

  // Fechas futuras (hoy, mañana, pasado mañana) para que aparezcan en el Home
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // 2. Definimos los 8 partidos con sus pronósticos
  const matchesData = [
    {
      league: 'Inglaterra Championship',
      homeTeam: 'Cardiff',
      awayTeam: 'West Ham',
      matchDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // En 2 horas
      sport: 'FUTBOL' as const,
      predictions: [
        { type: '+1.5 goles FT', probability: 91, isPremium: false },
        { type: '+2.5 goles FT', probability: 76, isPremium: true },
        { type: 'Ambos anotan', probability: 76, isPremium: true },
        { type: 'Gana West Ham', probability: 62, isPremium: true },
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'Real Madrid',
      awayTeam: 'AEK',
      matchDate: tomorrow,
      sport: 'FUTBOL' as const,
      predictions: [
        { type: 'Madrid +1.5 goles', probability: 91, isPremium: false },
        { type: 'Mbappé anota 1 gol', probability: 86, isPremium: true },
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'Liverpool',
      awayTeam: 'Fenerbahce',
      matchDate: tomorrow,
      sport: 'FUTBOL' as const,
      predictions: [
        { type: 'Gana Liverpool', probability: 79, isPremium: true },
        { type: '+1.5 goles FT', probability: 86, isPremium: false },
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'RB Leipzig',
      awayTeam: 'Manchester City',
      matchDate: tomorrow,
      sport: 'FUTBOL' as const,
      predictions: [
        { type: 'Gana Manchester City', probability: 81, isPremium: true },
        { type: '+1.5 goles FT', probability: 85, isPremium: false }, // Asigné 85% al que faltaba
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'Porto',
      awayTeam: 'Napoli',
      matchDate: dayAfter,
      sport: 'FUTBOL' as const,
      predictions: [
        { type: 'Menos de 4.5 goles FT', probability: 76, isPremium: true },
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'PSV',
      awayTeam: 'Brujas',
      matchDate: dayAfter,
      sport: 'FUTBOL' as const,
      predictions: [
        { type: 'Ambos anotan (Sí)', probability: 81, isPremium: true },
      ]
    },
    {
      league: 'Champions League',
      homeTeam: 'Arsenal',
      awayTeam: 'Slavia Praga',
      matchDate: dayAfter,
      sport: 'FUTBOL' as const,
      predictions: [
        { type: '+1.5 goles FT', probability: 84, isPremium: false },
      ]
    },
    {
      league: 'Brasil Serie A',
      homeTeam: 'Flamengo',
      awayTeam: 'Gremio',
      matchDate: dayAfter,
      sport: 'FUTBOL' as const,
      predictions: [
        { type: 'Menos de 3.5 goles FT', probability: 79, isPremium: true },
        { type: 'Gana Flamengo', probability: 87, isPremium: true },
      ]
    },
  ];

  // 3. Insertamos todo en la base de datos
  for (const match of matchesData) {
    await prisma.match.create({
      data: {
        league: match.league,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        matchDate: match.matchDate,
        sport: match.sport,
        predictions: {
          create: match.predictions,
        },
      },
    });
  }

  console.log('✅ ¡8 partidos reales insertados con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
