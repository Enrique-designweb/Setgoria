// prisma/create-admin.ts
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'leonardofonseca302@gmail.com'; // 👈 Correo del dueño
  const adminName = 'Leonardo Fonseca';
  
  const plainPassword = 'Leofonseca24'; // 👈 Contraseña del dueño
  
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { 
      role: 'ADMIN', 
      hasVerifiedOtp: true, // Para que no le pida OTP en el primer login
      password: hashedPassword 
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: 'ADMIN',
      hasVerifiedOtp: true,
      password: hashedPassword, 
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
