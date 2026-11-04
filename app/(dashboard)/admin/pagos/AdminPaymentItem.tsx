// app/(dashboard)/admin/pagos/AdminPaymentItem.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, User as UserIcon, Hash } from "lucide-react";
import { Transaction } from "@/src/generated/prisma/client";

type TransactionWithUser = Omit<Transaction, "amount"> & { 
  amount: number; 
  user: { name: string | null; email: string | null } 
};

export default function AdminPaymentItem({ transaction }: { transaction: TransactionWithUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm("¿Confirmas que el dinero ha llegado a tu cuenta y deseas activar la suscripción?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: transaction.id }),
      });

      if (!res.ok) throw new Error("Error al aprobar");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al aprobar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-set-bg border border-gray-800 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pendiente de Revisión
          </span>
          <span className="text-xs text-gray-400 font-mono">ID: {transaction.id.slice(0, 8)}...</span>
        </div>
        
        <h3 className="text-white font-bold text-lg mt-1">${transaction.amount} {transaction.currency}</h3>
        <p className="text-sm text-gray-400">Plan: <span className="text-orange-400 font-bold uppercase">{transaction.plan}</span> | Método: <span className="text-white">{transaction.method}</span></p>
        
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <UserIcon className="w-3 h-3" />
          {transaction.user.name || "Sin nombre"} ({transaction.user.email})
        </div>

        {/* Referencia de ETECSA puesta por el usuario */}
        {transaction.referenceNumber && (
          <div className="mt-3 bg-white/5 border border-gray-800 px-3 py-2 rounded-lg inline-block">
            <span className="text-xs text-gray-400 flex items-center gap-1 mb-1">
              <Hash className="w-3 h-3" /> Ref. ETECSA:
            </span>
            <span className="text-sm font-mono text-white select-all font-bold tracking-wider">{transaction.referenceNumber}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0 items-end justify-center">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 w-full md:w-auto"
        >
          {loading ? "Procesando..." : <><CheckCircle className="w-4 h-4" /> Aprobar Suscripción</>}
        </button>
      </div>

    </div>
  );
}
