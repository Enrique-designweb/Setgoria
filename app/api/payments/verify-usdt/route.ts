// app/api/payments/verify-usdt/route.ts
import { NextResponse } from "next/server"; // 👈 Faltaba esta importación
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Plan } from "@/src/generated/prisma/client";
import { processSuccessfulPayment } from "@/lib/subscription-logic"; // 👈 Faltaba esta importación

const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // Contrato oficial de USDT en TRON

// 👈 DIRECCIÓN TRON REAL CORREGIDA
const YOUR_WALLET = "TPghZv26N8xwjaS6ZEoHpHtUD6eXo1qjXe"; 

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { txHash, transactionId } = await req.json();

    if (!txHash || !transactionId) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // 1. Verificar que la transacción pertenece al usuario y está pendiente
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== session.user.id) {
      return NextResponse.json({ message: "Transacción no válida" }, { status: 404 });
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json({ message: "Esta transacción ya fue procesada" }, { status: 400 });
    }

    // 2. Consultar TronScan
    const response = await fetch(`https://apilist.tronscanapi.com/api/transaction-info?hash=${txHash}`);
    const txData = await response.json();

    // 3. Validaciones de seguridad
    if (!txData || txData.contractRet !== "SUCCESS") {
      return NextResponse.json({ message: "Transacción no válida o fallida" }, { status: 400 });
    }

    // 4. Verificar que sea una transferencia de USDT a tu wallet
    const transfer = txData.trc20TransferInfo?.[0];
    if (!transfer || transfer.to_address !== YOUR_WALLET || transfer.contract_address !== USDT_CONTRACT) {
      return NextResponse.json({ message: "La transacción no corresponde a un pago a SETGORIA" }, { status: 400 });
    }

    // 5. Verificar el monto (USDT tiene 6 decimales)
    const amountReceived = transfer.amount / 1_000_000;
    const expectedAmount = Number(transaction.amount); // El monto que se guardó al crear la transacción

    if (amountReceived < expectedAmount) {
      return NextResponse.json({ message: `El monto recibido ($${amountReceived}) es menor al esperado ($${expectedAmount})` }, { status: 400 });
    }

    // 6. Evitar reutilización del hash
    const existingTx = await prisma.transaction.findFirst({
      where: { usdtTxHash: txHash },
    });
    if (existingTx) {
      return NextResponse.json({ message: "Este hash ya fue utilizado" }, { status: 400 });
    }

    // 7. ¡Todo correcto! Activar suscripción automáticamente
    await prisma.$transaction(async (tx) => {
      // Marcar transacción como completada
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED", usdtTxHash: txHash },
      });

      // 👇 LLAMAMOS A LA FUNCIÓN MÁGICA (La que creamos en lib/subscription-logic.ts)
      await processSuccessfulPayment(tx, session.user.id, transaction.plan as Plan);
    });

    return NextResponse.json({ success: true, message: "Pago verificado y suscripción activada" });

  } catch (error) {
    console.error("Error verificando USDT:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
