// lib/subscription-logic.ts
import { Prisma, Plan } from "@/src/generated/prisma/client";

export async function processSuccessfulPayment(
  tx: Prisma.TransactionClient,
  userId: string,
  plan: Plan
) {
  // 1. Calcular días base
  const days = plan === "MONTHLY" ? 30 : 7;

  // 2. Buscar si ya tiene una suscripción activa
  const existingSub = await tx.subscription.findFirst({
    where: { userId, status: "ACTIVE", expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "desc" },
  });

  const baseDate = existingSub?.expiresAt ?? new Date();
  const expiresAt = new Date(baseDate);
  expiresAt.setDate(expiresAt.getDate() + days);

  // 3. Crear o extender la suscripción
  if (existingSub) {
    await tx.subscription.update({
      where: { id: existingSub.id },
      data: { expiresAt, plan },
    });
  } else {
    await tx.subscription.create({
      data: { userId, plan, status: "ACTIVE", expiresAt },
    });
  }

  // 4. 👇 LA MAGIA DE LOS REFERIDOS (Aplica para cualquier método de pago)
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { referredById: true },
  });

  if (user?.referredById) {
    // A) Al comprador se le suman 3 días extra
    const userExtraExpire = new Date(expiresAt);
    userExtraExpire.setDate(userExtraExpire.getDate() + 3);
    await tx.subscription.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { expiresAt: userExtraExpire },
    });
    
    await tx.notification.create({
      data: { userId, message: "🎁 ¡Has ganado 3 días extra por registrarte con un enlace de invitación!" },
    });

    // B) Al que lo invitó se le suma 1 día extra
    const referrerSub = await tx.subscription.findFirst({
      where: { userId: user.referredById, status: "ACTIVE" },
    });

    if (referrerSub) {
      const refExpire = new Date(referrerSub.expiresAt);
      refExpire.setDate(refExpire.getDate() + 1);
      await tx.subscription.update({
        where: { id: referrerSub.id },
        data: { expiresAt: refExpire },
      });
      
      await tx.notification.create({
        data: { userId: user.referredById, message: "🎁 ¡Un amigo tuyo se ha suscrito! Has ganado 1 día Premium extra." },
      });
    }
  }

  // 5. Notificación de pago exitoso para el comprador
  await tx.notification.create({
    data: { userId, message: `🎉 ¡Pago confirmado! Tu plan ${plan} está activo.` },
  });

  return { expiresAt };
}
