// app/api/payments/qvapay-webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Plan } from "@/src/generated/prisma/client";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-qvapay-signature");
    const secret = process.env.QVAPAY_APP_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ message: "Firma faltante" }, { status: 401 });
    }

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (signature.replace("sha256=", "") !== expected) {
      return NextResponse.json({ message: "Firma inválida" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { status, remote_id } = payload;

    if (status !== "paid" && status !== "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: remote_id },
    });

    if (!transaction) {
      return NextResponse.json({ received: true });
    }

    if (transaction.status === "COMPLETED") {
      return NextResponse.json({ received: true, message: "Pago ya procesado" });
    }

    let days = 7; 
    if (transaction.plan === "MONTHLY") days = 30;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // Transacción atómica
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED" },
      }),
      prisma.subscription.create({
        data: {
          userId: transaction.userId,
          plan: transaction.plan as Plan,
          status: "ACTIVE",
          expiresAt,
        },
      }),
      // 👈 Notificación para el usuario
      prisma.notification.create({
        data: {
          userId: transaction.userId,
          message: `🎉 ¡Pago automático confirmado! Disfruta de tu suscripción ${transaction.plan} hasta el ${expiresAt.toLocaleDateString('es-ES')}.`,
        },
      }),
    ]);

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Error en webhook:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
