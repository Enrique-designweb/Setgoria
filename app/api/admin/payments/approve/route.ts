import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Plan } from "@/src/generated/prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const { transactionId } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ message: "ID requerido" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // ✅ Idempotencia atómica: solo si sigue en PENDING_REVIEW
      const updated = await tx.transaction.updateMany({
        where: { id: transactionId, status: "PENDING_REVIEW" },
        data: { status: "COMPLETED" },
      });

      if (updated.count === 0) return { processed: false };

      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
      });
      if (!transaction) return { processed: false };

      const daysToAdd = transaction.plan === "MONTHLY" ? 30 : 7;

      // ✅ Extender suscripción activa si existe
      const existingSub = await tx.subscription.findFirst({
        where: {
          userId: transaction.userId,
          status: "ACTIVE",
          expiresAt: { gt: new Date() },
        },
        orderBy: { expiresAt: "desc" },
      });

      const baseDate = existingSub?.expiresAt ?? new Date();
      const expiresAt = new Date(baseDate);
      expiresAt.setDate(expiresAt.getDate() + daysToAdd);

      if (existingSub) {
        await tx.subscription.update({
          where: { id: existingSub.id },
          data: { expiresAt, plan: transaction.plan as Plan },
        });
      } else {
        await tx.subscription.create({
          data: {
            userId: transaction.userId,
            plan: transaction.plan as Plan,
            status: "ACTIVE",
            expiresAt,
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: transaction.userId,
          message: `✅ ¡Tu pago fue aprobado! Plan ${transaction.plan} activo hasta ${expiresAt.toLocaleDateString("es-ES", { dateStyle: "long" })}.`,
        },
      });

      // ✅ Auditoría
      await tx.adminLog.create({
        data: {
          adminId: session.user.id,
          action: "APPROVE_PAYMENT",
          targetId: transactionId,
          metadata: { amount: Number(transaction.amount), plan: transaction.plan },
        },
      });

      return { processed: true };
    });

    if (!result.processed) {
      return NextResponse.json(
        { message: "Transacción no válida o ya procesada" },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: "Pago aprobado" }, { status: 200 });
  } catch (error) {
    console.error("Error aprobando pago:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
