// app/api/payments/qvapay-webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma, Plan } from "@/src/generated/prisma/client";
import { processSuccessfulPayment } from "@/lib/subscription-logic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-qvapay-signature");
    const secret = process.env.QVAPAY_APP_SECRET;

    if (!signature || !secret) return NextResponse.json({ message: "Firma faltante" }, { status: 401 });

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const provided = signature.replace("sha256=", "");

    if (provided.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
      return NextResponse.json({ message: "Firma inválida" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as { status?: string; remote_id?: string; transaction_uuid?: string; };
    const { status, remote_id, transaction_uuid } = payload;

    if (status !== "paid" && status !== "COMPLETED") return NextResponse.json({ received: true });

    const orConditions: Prisma.TransactionWhereInput[] = [];
    if (remote_id) orConditions.push({ id: remote_id }, { reference: remote_id });
    if (transaction_uuid) orConditions.push({ reference: transaction_uuid });

    if (orConditions.length === 0) return NextResponse.json({ message: "Payload inválido" }, { status: 400 });

    const transaction = await prisma.transaction.findFirst({ where: { OR: orConditions } });
    if (!transaction) return NextResponse.json({ received: true });

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.updateMany({
        where: { id: transaction.id, status: { not: "COMPLETED" } },
        data: { status: "COMPLETED" },
      });

      if (updated.count === 0) return { processed: false };

      // 👇 LLAMAMOS A LA FUNCIÓN MÁGICA
      await processSuccessfulPayment(tx, transaction.userId, transaction.plan as Plan);

      return { processed: true };
    });

    return NextResponse.json({ received: true, processed: result.processed }, { status: 200 });
  } catch (error) {
    console.error("Error crítico en webhook QvaPay:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
