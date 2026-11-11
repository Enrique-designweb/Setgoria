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

// Función auxiliar para enviar OTP por Telegram
async function sendTelegramOtp(chatId: string, code: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🔐 <b>Tu código de verificación SETGORIA es:</b>\n\n<code>${code}</code>\n\nVálido por 30 minutos.`,
      parse_mode: "HTML",
    }),
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const identifier = `payment:${session.user.id}`;
    const { success } = await paymentLimiter.limit(identifier);
    if (!success) return NextResponse.json({ message: "Límite de intentos alcanzado." }, { status: 429 });

    const body = await req.json();
    const validation = createPaymentSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ message: validation.error.issues[0]?.message }, { status: 400 });

    const { plan, method } = validation.data;

    const planConfig: Record<string, { amount: number; currency: Currency }> = {
      WEEKLY: { amount: 9, currency: Currency.USD },
      MONTHLY: { amount: 24, currency: Currency.USD },
    };

    const selectedPlan = planConfig[plan];
    let currency = selectedPlan.currency;
    if (method === "TRANSFERMOVIL") currency = Currency.CUP;

    let plainCode = null;
    let hashedCode = null;
    let expiresAt = null;

    // 👇 SI ES MENSUAL (PREMIUM) O CUALQUIER PAGO MANUAL, GENERAMOS OTP
    if (method === "TRANSFERMOVIL" || method === "CARD" || method === "USDT") {
      const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
      plainCode = `SETG-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}`;
      hashedCode = crypto.createHash('sha256').update(plainCode).digest('hex');
      expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      // 1. Enviar por Email (Brevo)
      if (session.user.email) {
        await sendVerificationEmail(session.user.email, plainCode);
      }

      // 2. Si es PREMIUM (MONTHLY) o tiene Telegram vinculado, enviar por Telegram
      const tgUser = await prisma.telegramUser.findFirst({
        where: { userId: session.user.id }
      });

      if (tgUser && tgUser.chatId) {
        await sendTelegramOtp(tgUser.chatId, plainCode);
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        plan: plan as Plan,
        amount: selectedPlan.amount,
        currency: currency,
        method: method as PaymentMethod,
        status: "PENDING",
        paymentCodeHash: hashedCode,
        codeExpiresAt: expiresAt,
      },
    });

    if (method === "QVAPAY") {
      const invoice = await qvapay.app.createInvoice({
        amount: selectedPlan.amount,
        description: `Suscripción ${plan} - SETGORIA`,
        remote_id: transaction.id,
        webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/qvapay-webhook`,
      });

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { reference: invoice.transaction_uuid },
      });

      const paymentUrl = invoice.url || (invoice as { payment_url?: string }).payment_url;
      return NextResponse.json({ redirectUrl: paymentUrl });
    }

    return NextResponse.json({ transactionId: transaction.id, paymentCode: plainCode });

  } catch (error: unknown) {
    console.error("Error creando transacción:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
