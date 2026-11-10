// app/api/admin/transactions/[id]/approve-qvapay/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { processSuccessfulPayment } from "@/lib/subscription-logic"; // Usamos tu función mágica de referidos
import { Plan } from "@/src/generated/prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction || transaction.status === "COMPLETED") {
      return NextResponse.json({ message: "Transacción no válida o ya completada" }, { status: 400 });
    }

    // Procesamos el pago y activamos la suscripción
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED" },
      });

      // Esta función suma los días, maneja referidos y envía la notificación
      await processSuccessfulPayment(tx, transaction.userId, transaction.plan as Plan);
    });

    return NextResponse.json({ success: true, message: "Pago aprobado y suscripción activada" });
  } catch (error) {
    console.error("Error aprobando pago:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
