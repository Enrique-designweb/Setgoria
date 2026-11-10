// app/api/payments/qvapay-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const APP_SECRET = process.env.QVAPAY_APP_SECRET!;

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  
  const providedSignature = signatureHeader.slice("sha256=".length);
  const expectedSignature = crypto
    .createHmac("sha256", APP_SECRET)
    .update(rawBody)
    .digest("hex");
    
  const a = Buffer.from(providedSignature, "hex");
  const b = Buffer.from(expectedSignature, "hex");
  
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-qvapay-signature");

    // 1. Seguridad
    if (!verifySignature(rawBody, signature)) {
      console.warn("Intento de webhook con firma inválida.");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { transaction_uuid, status, remote_id } = payload;

    // 2. Buscar la transacción por el ID que le enviamos a QvaPay
    const transaction = await prisma.transaction.findUnique({
      where: { id: remote_id },
    });

    if (!transaction) {
      console.warn(`Transacción no encontrada para remote_id: ${remote_id}`);
      return NextResponse.json({ received: true }); // Retornamos 200 para que QvaPay no reintente
    }

    // 3. Si ya fue aprobada por el admin, ignorar
    if (transaction.status === "COMPLETED") {
      return NextResponse.json({ received: true, message: "Ya aprobada" });
    }

    // 4. Si el pago fue exitoso, pasarlo a revisión manual
    if (status === "paid") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: "PENDING_REVIEW", // 👈 CAMBIO CLAVE: Ahora queda en revisión
          reference: transaction_uuid,
          metadata: payload, 
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error en webhook QvaPay:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
