// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts', // 👈 Ahora apunta al archivo correcto
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
