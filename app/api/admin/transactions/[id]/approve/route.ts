// app/api/admin/transactions/[id]/approve/route.ts
import { NextResponse } from "next/server"; // 👈 Faltaba esta importación
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { processSuccessfulPayment } from "@/lib/subscription-logic"; // 👈 Faltaba esta
import { Plan } from "@/src/generated/prisma/client";

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // 👈 En Next.js 15/16 params es una promesa
) {
  try {
    // 1. Verificar que el usuario sea Administrador
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 2. Obtener el ID de la transacción
    const { id } = await params; // 👈 Hacemos await a los params

    const transaction = await prisma.transaction.findUnique({ 
      where: { id } 
    });
    
    if (!transaction) {
      return NextResponse.json({ message: "Transacción no encontrada" }, { status: 404 });
    }

    if (transaction.status === "COMPLETED") {
      return NextResponse.json({ message: "Esta transacción ya fue aprobada" }, { status: 400 });
    }

    // 3. Procesar la aprobación
    await prisma.$transaction(async (tx) => {
      // Marcar transacción como completada
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED" }
      });

      // 👇 AQUÍ LLAMAMOS A LA MAGIA (Así los pagos manuales también dan referidos)
      await processSuccessfulPayment(tx, transaction.userId, transaction.plan as Plan);
    });

    return NextResponse.json({ success: true, message: "Pago aprobado y suscripción activada" });

  } catch (error) {
    console.error("Error aprobando transacción:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
