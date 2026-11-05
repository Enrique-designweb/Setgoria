// app/(dashboard)/admin/pagos/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreditCard, ArrowLeft } from "lucide-react";
import AdminPaymentItem from "./AdminPaymentItem";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export default async function AdminPaymentsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const pendingTransactions = await prisma.transaction.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 👈 CONVERSIÓN CLAVE: Decimal de Prisma a Number nativo de JS
  const serializedTransactions = pendingTransactions.map(tx => ({
    ...tx,
    amount: Number(tx.amount),
  }));

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 bg-set-surface border border-gray-800 rounded-lg hover:text-white text-gray-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tight flex items-center gap-2">
            <CreditCard className="text-orange-500 w-6 h-6" /> 
            Aprobación de Pagos
          </h1>
          <p className="text-sm text-gray-400 mt-1">Verifica las transferencias y activa las suscripciones.</p>
        </div>
      </div>

      {/* Lista de Pagos */}
      <div className="flex flex-col gap-4">
        {serializedTransactions.length === 0 ? (
          <div className="bg-set-surface border border-gray-800 rounded-2xl p-10 text-center">
            <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white mt-4">Todo al día</h2>
            <p className="text-gray-400 text-sm mt-1">No hay pagos pendientes de verificación en este momento.</p>
          </div>
        ) : (
          serializedTransactions.map((tx) => (
            <AdminPaymentItem key={tx.id} transaction={tx} />
          ))
        )}
      </div>
    </div>
  );
}
