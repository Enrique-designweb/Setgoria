// lib/prisma.ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
// 👈 Importamos el cliente desde la RUTA GENERADA, no desde '@prisma/client'
import { PrismaClient } from '../src/generated/prisma/client'; 

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Creamos el adaptador de PostgreSQL
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // 👈 Pasamos el adaptador al constructor
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
