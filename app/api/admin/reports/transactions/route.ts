// app/api/admin/reports/transactions/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    // Buscamos todas las transacciones completadas
    const transactions = await prisma.transaction.findMany({
      where: { status: "COMPLETED" },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Generamos el CSV manualmente
    const headers = "ID,Email,Plan,Monto,Moneda,Metodo,Fecha\n";
    
    const rows = transactions.map(tx => {
      return `${tx.id},${tx.user.email},${tx.plan},${tx.amount},${tx.currency},${tx.method},${tx.createdAt.toISOString()}`;
    }).join("\n");

    const csv = headers + rows;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="transacciones_setgoria.csv"',
      },
    });
  } catch (error) {
    console.error("Error generando reporte:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
