"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, User as UserIcon, Hash, XCircle, ShieldAlert, CreditCard } from "lucide-react";
import { Transaction } from "@/src/generated/prisma/client";

type TransactionWithUser = Omit<Transaction, "amount"> & { 
  amount: number; 
  user: { name: string | null; email: string | null } 
};

export default function AdminPaymentItem({ transaction }: { transaction: TransactionWithUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm("¿Confirmas que deseas ENTREGAR la suscripción a este usuario?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: transaction.id }),
      });

      if (res.status === 409) {
        alert("Este pago ya fue entregado previamente.");
        router.refresh();
        return;
      }

      if (!res.ok) throw new Error("Error al entregar suscripción");
      
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al entregar la suscripción");
    } finally {
      setLoading(false);
    }
  };

  const isPending = transaction.status === "PENDING" || transaction.status === "PENDING_REVIEW";
  const isCompleted = transaction.status === "COMPLETED";

  return (
    <div className="bg-[#1A1D24] border border-gray-800 p-4 md:p-5 rounded-xl flex flex-col gap-4">
      
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-start">
          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1 ${
            isCompleted ? 'bg-green-500/10 text-green-500' : 
            isPending ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {isCompleted ? <CheckCircle className="w-3 h-3" /> : isPending ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {isCompleted ? "ENTREGADO" : transaction.status}
          </span>
          <span className="text-xs text-gray-500 font-mono">ID: {transaction.id.slice(0, 8)}...</span>
        </div>
        
        <h3 className="text-white font-bold text-xl mt-2">${transaction.amount} <span className="text-sm text-gray-400">{transaction.currency}</span></h3>
        
        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
          <span className="text-gray-400">Plan: <span className="text-orange-400 font-bold uppercase">{transaction.plan}</span></span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">Método:</span>
          <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> {transaction.method}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 bg-black/20 p-2 rounded-lg">
          <UserIcon className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="truncate">{transaction.user.name || "Sin nombre"} ({transaction.user.email})</span>
        </div>

        {transaction.referenceNumber && (
          <div className="mt-2 bg-white/5 border border-gray-800 px-3 py-2 rounded-lg inline-block w-full">
            <span className="text-xs text-gray-400 flex items-center gap-1 mb-1">
              <Hash className="w-3 h-3" /> Ref. de Pago:
            </span>
            <span className="text-sm font-mono text-white select-all font-bold tracking-wider">{transaction.referenceNumber}</span>
          </div>
        )}
      </div>

      {/* BOTÓN DE ENTREGAR (Se bloquea si ya está completado) */}
      <div className="flex justify-end w-full mt-2 border-t border-gray-800 pt-4">
        <button
          onClick={handleApprove}
          disabled={loading || isCompleted}
          className={`flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-lg transition-colors w-full ${
            isCompleted 
              ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700" 
              : "bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30"
          }`}
        >
          {loading ? (
            "Procesando..."
          ) : isCompleted ? (
            <><ShieldAlert className="w-5 h-5" /> Suscripción Entregada</>
          ) : (
            <><CheckCircle className="w-5 h-5" /> Entregar Suscripción</>
          )}
        </button>
      </div>

    </div>
  );
}
