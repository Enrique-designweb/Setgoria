// app/api/payments/verify-code/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";
import { authLimiter } from "@/lib/ratelimit"; // 👈 Importamos el limitador

const verifySchema = z.object({
  transactionId: z.string().cuid(),
  enteredCode: z.string().length(14),
  referenceNumber: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    // 👇 RATE LIMITING (Máximo 5 intentos por usuario cada 15 min)
    const { success } = await authLimiter.limit(`otp:${session.user.id}`);
    if (!success) {
      return NextResponse.json(
        { message: "Demasiados intentos fallidos. Espera 15 minutos." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = verifySchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });

    const { transactionId, enteredCode, referenceNumber } = validation.data;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== session.user.id) {
      return NextResponse.json({ message: "Transacción no encontrada" }, { status: 404 });
    }

    if (transaction.codeExpiresAt && transaction.codeExpiresAt < new Date()) {
      return NextResponse.json({ message: "El código ha expirado. Por favor, genera uno nuevo." }, { status: 400 });
    }

    const enteredHash = crypto.createHash('sha256').update(enteredCode.toUpperCase()).digest('hex');

    if (enteredHash !== transaction.paymentCodeHash) {
      return NextResponse.json({ message: "Código de verificación incorrecto." }, { status: 400 });
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "PENDING_REVIEW",
        referenceNumber: referenceNumber,
        paymentCodeHash: null,
      },
    });

    return NextResponse.json({ message: "Pago verificado. Espera la aprobación del administrador." });

  } catch (error: unknown) { // 👈 Corregido TS
    console.error("Error en verificación:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
