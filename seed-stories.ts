// seed-stories.ts
import { PrismaClient } from './src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('📸 Insertando 4 historias (24h de duración)...');

  // Calculamos la fecha de expiración (Ahora + 24 horas)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await prisma.story.createMany({
    data: [
      { 
        title: "Resumen Madrid", 
        imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80", // Imagen de fútbol
        expiresAt 
      },
      { 
        title: "Gol de la Jornada", 
        imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80", // Otra de fútbol
        expiresAt 
      },
      { 
        title: "Top Tenis ATP", 
        imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&q=80", // Imagen de tenis
        expiresAt 
      },
      { 
        title: "Apuesta del Día", 
        imageUrl: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500&q=80", // Otra de tenis
        expiresAt 
      },
    ]
  });

  console.log('✅ ¡4 Historias insertadas con expiración de 24h!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
