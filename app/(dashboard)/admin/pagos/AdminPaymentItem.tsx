// app/(dashboard)/admin/pagos/AdminPaymentItem.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, User as UserIcon, CreditCard, ShieldAlert } from "lucide-react";
import { Transaction } from "@/src/generated/prisma/client";
import { toast } from "sonner";

type TransactionWithUser = Omit<Transaction, "amount"> & { 
  amount: number; 
  user: { name: string | null; email: string | null } 
};

export default function AdminPaymentItem({ transaction }: { transaction: TransactionWithUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    const toastId = toast.loading("Aprobando pago...");
    setLoading(true);
    try {
      // 👈 Apunta a la ruta correcta con el ID de la transacción
      const res = await fetch(`/api/admin/transactions/${transaction.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 409 || res.status === 400) {
        toast.warning("Este pago ya fue entregado.", { id: toastId });
        router.refresh();
        return;
      }
      if (!res.ok) throw new Error("Error al aprobar");
      
      toast.success("Suscripción entregada", { id: toastId });
      router.refresh();
    } catch (error: unknown) {
      console.error("Error al aprobar transacción:", error);
      toast.error("Error al procesar", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Aceptamos tanto PENDING como PENDING_REVIEW
  const isPending = transaction.status === "PENDING" || transaction.status === "PENDING_REVIEW";
  const isCompleted = transaction.status === "COMPLETED";

  return (
    <div className="bg-[#1A1D24] border border-gray-800 p-3 rounded-xl flex items-center justify-between gap-3">
      
      {/* Izquierda: Icono y Detalles */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`p-2.5 rounded-full shrink-0 ${isCompleted ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
          {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-white font-bold text-sm truncate">
            Plan {transaction.plan}
          </span>
          <span className="text-xs text-gray-400 truncate flex items-center gap-1">
            <UserIcon className="w-3 h-3" /> {transaction.user.name || transaction.user.email}
          </span>
          <span className="text-[10px] text-gray-500 uppercase font-semibold mt-0.5 flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> {transaction.method}
          </span>
        </div>
      </div>

      {/* Derecha: Monto y Botón */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`font-black text-base ${isCompleted ? 'text-green-500' : 'text-white'}`}>
          ${transaction.amount} <span className="text-xs font-normal text-gray-500">USD</span>
        </span>
        
        {isPending ? (
          <button
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "..." : "Aprobar"}
          </button>
        ) : (
          <span className="text-[10px] text-gray-500 flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
            <ShieldAlert className="w-3 h-3" /> Entregado
          </span>
        )}
      </div>

    </div>
  );
}
