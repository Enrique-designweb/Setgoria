// app/api/admin/transactions/[id]/approve/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { processSuccessfulPayment } from "@/lib/subscription-logic";
import { Plan } from "@/src/generated/prisma/client";

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params; 

    const transaction = await prisma.transaction.findUnique({ 
      where: { id } 
    });
    
    if (!transaction) {
      return NextResponse.json({ message: "Transacción no encontrada" }, { status: 404 });
    }

    if (transaction.status === "COMPLETED") {
      return NextResponse.json({ message: "Esta transacción ya fue aprobada" }, { status: 409 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED" }
      });

      // Esta función suma los días y maneja referidos
      await processSuccessfulPayment(tx, transaction.userId, transaction.plan as Plan);
    });

    return NextResponse.json({ success: true, message: "Pago aprobado y suscripción activada" });

  } catch (error) {
    console.error("Error aprobando transacción:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
