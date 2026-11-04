// app/api/admin/payments/approve/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const { transactionId } = await req.json();
    if (!transactionId) return NextResponse.json({ message: "ID requerido" }, { status: 400 });

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.status !== "PENDING_REVIEW") {
      return NextResponse.json({ message: "Transacción no válida" }, { status: 404 });
    }

    let daysToAdd = 7; 
    if (transaction.plan === "MONTHLY") daysToAdd = 30;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysToAdd);

    // Transacción atómica de Prisma
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      }),
      prisma.subscription.create({
        data: {
          userId: transaction.userId,
          plan: transaction.plan, // Prisma acepta el string "WEEKLY" o "MONTHLY"
          status: "ACTIVE",
          expiresAt: expiresAt,
        },
      }),
      prisma.notification.create({
        data: {
          userId: transaction.userId,
          message: `✅ ¡Tu pago ha sido aprobado! Tu plan ${transaction.plan} está activo hasta el ${expiresAt.toLocaleDateString('es-ES')}.`,
        },
      }),
    ]);

    return NextResponse.json({ message: "Pago aprobado" }, { status: 200 });

  } catch (error) {
    console.error("Error aprobando pago:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
