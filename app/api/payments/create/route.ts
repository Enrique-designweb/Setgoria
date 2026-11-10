// app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { QvaPaySDK } from "sdk-qvapay";
import { paymentLimiter } from "@/lib/ratelimit";
import { createPaymentSchema } from "@/lib/validations";
import { Plan, PaymentMethod, Currency } from "@/src/generated/prisma/client";
import { sendVerificationEmail } from "@/lib/email"; 

const qvapay = new QvaPaySDK({
  appId: process.env.QVAPAY_APP_ID!,
  appSecret: process.env.QVAPAY_APP_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 1. RATE LIMITING
    const identifier = `payment:${session.user.id}`;
    const { success, limit, remaining, reset } = await paymentLimiter.limit(identifier);
    
    if (!success) {
      return NextResponse.json(
        { message: "Límite de intentos alcanzado. Por seguridad, espera 24 horas para volver a intentarlo." },
        { 
          status: 429,
          headers: { 
            'X-RateLimit-Limit': limit.toString(), 
            'X-RateLimit-Remaining': remaining.toString(), 
            'X-RateLimit-Reset': reset.toString() 
          } 
        }
      );
    }

    // 2. VALIDACIÓN CON ZOD
    const body = await req.json();
    const validation = createPaymentSchema.safeParse(body);
    
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Datos de entrada inválidos";
      return NextResponse.json({ message: errorMessage }, { status: 400 });
    }

    const { plan, method } = validation.data;

    // 3. Configuración de planes
    const planConfig: Record<string, { amount: number; currency: Currency }> = {
      WEEKLY: { amount: 9, currency: Currency.USD },
      MONTHLY: { amount: 24, currency: Currency.USD },
    };

    const selectedPlan = planConfig[plan];
    if (!selectedPlan) {
      return NextResponse.json({ message: "Plan inválido" }, { status: 400 });
    }

    let currency = selectedPlan.currency;
    if (method === "TRANSFERMOVIL") currency = Currency.CUP;

    // 4. Generar Código OTP (solo para pagos manuales)
    let plainCode = null;
    let hashedCode = null;
    let expiresAt = null;

    if (method === "TRANSFERMOVIL" || method === "CARD" || method === "USDT") {
      const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
      plainCode = `SETG-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}`;
      hashedCode = crypto.createHash('sha256').update(plainCode).digest('hex');
      expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      if (process.env.NODE_ENV === 'development') {
        console.log('\n=========================================');
        console.log(`💳 CÓDIGO DE PAGO PARA ${session.user.email}: ${plainCode}`);
        console.log('=========================================\n');
      }
    }

    // 5. Crear la transacción en BD
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        plan: plan as Plan,
        amount: selectedPlan.amount,
        currency: currency,
        method: method as PaymentMethod,
        status: "PENDING", // Al crearse, queda pendiente
        paymentCodeHash: hashedCode,
        codeExpiresAt: expiresAt,
      },
    });

    // 6. ENVIAR EL CORREO CON EL CÓDIGO OTP
    if (plainCode && session.user.email) {
      await sendVerificationEmail(session.user.email, plainCode);
    }

    // 7. Flujo QvaPay (Automático, pero con revisión manual posterior)
    if (method === "QVAPAY") {
      const invoice = await qvapay.app.createInvoice({
        amount: selectedPlan.amount,
        description: `Suscripción ${plan} - SETGORIA`,
        remote_id: transaction.id, // 👈 Enviamos el ID de la transacción
        webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/qvapay-webhook`,
      });

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { reference: invoice.transaction_uuid },
      });

      const paymentUrl = invoice.url || (invoice as { payment_url?: string }).payment_url;
      if (!paymentUrl) throw new Error("QvaPay no devolvió una URL de pago válida.");

      return NextResponse.json({ redirectUrl: paymentUrl });
    }

    // 8. Flujo Manual
    return NextResponse.json({ 
      transactionId: transaction.id,
      paymentCode: plainCode 
    });

  } catch (error: unknown) {
    console.error("Error creando transacción:", error);
    const errorMessage = error instanceof Error ? error.message : "Error del servidor";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
