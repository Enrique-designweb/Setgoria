import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Plan, Prisma } from "@/src/generated/prisma/client";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-qvapay-signature");
    const secret = process.env.QVAPAY_APP_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ message: "Firma faltante" }, { status: 401 });
    }

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const provided = signature.replace("sha256=", "");

    if (
      provided.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
    ) {
      return NextResponse.json({ message: "Firma inválida" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      status?: string;
      remote_id?: string;
      transaction_uuid?: string;
    };
    const { status, remote_id, transaction_uuid } = payload;

    if (status !== "paid" && status !== "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    // ✅ Tipado correcto: Prisma.TransactionWhereInput
    const orConditions: Prisma.TransactionWhereInput[] = [];
    if (remote_id) orConditions.push({ id: remote_id }, { reference: remote_id });
    if (transaction_uuid) orConditions.push({ reference: transaction_uuid });

    if (orConditions.length === 0) {
      return NextResponse.json({ message: "Payload inválido" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { OR: orConditions },
    });

    if (!transaction) {
      console.warn("Webhook: transacción no encontrada", { remote_id, transaction_uuid });
      return NextResponse.json({ received: true });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.updateMany({
        where: { id: transaction.id, status: { not: "COMPLETED" } },
        data: { status: "COMPLETED" },
      });

      if (updated.count === 0) return { processed: false };

      const days = transaction.plan === "MONTHLY" ? 30 : 7;

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
      expiresAt.setDate(expiresAt.getDate() + days);

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
          message: `🎉 ¡Pago confirmado! Suscripción ${transaction.plan} activa hasta ${expiresAt.toLocaleDateString("es-ES", { dateStyle: "long" })}.`,
        },
      });

      return { processed: true };
    });

    if (!result.processed) {
      return NextResponse.json({ received: true, message: "Pago ya procesado" });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error crítico en webhook QvaPay:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
