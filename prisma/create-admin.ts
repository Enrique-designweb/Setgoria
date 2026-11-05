// prisma/create-admin.ts
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs'; // 👈 Importamos bcryptjs
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'hernanglez06@gmail.com'; // 👈 CAMBIA ESTO POR EL CORREO DEL DUEÑO
  const adminName = 'Dueño SETGORIA';
  
  // 👈 CONTRASEÑA POR DEFECTO (Puedes cambiarla aquí)
  const plainPassword = 'Admin123!'; 
  
  // Encriptamos la contraseña
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { 
      role: 'ADMIN', 
      hasVerifiedOtp: true,
      password: hashedPassword // 👈 Actualizamos la contraseña si ya existe
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: 'ADMIN',
      hasVerifiedOtp: true,
      password: hashedPassword, // 👈 Guardamos la contraseña encriptada
      birthDate: new Date('1990-01-01'),
    },
  });

  console.log('✅ Administrador creado/actualizado:', admin.email);
  console.log(`🔑 Contraseña para iniciar sesión: ${plainPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
