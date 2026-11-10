// app/(dashboard)/admin/usuarios/AdminUserItem.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Shield, Wallet, AlertTriangle, Ban } from "lucide-react";
import { toast } from "sonner";

interface AdminUserItemProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    strikes: number;
    isBanned: boolean;
    hasSub: boolean;
    lastTx: { amount: number; method: string } | null;
  };
}

export default function AdminUserItem({ user }: AdminUserItemProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStrike = async (action: 'YELLOW' | 'RED') => {
    if (action === 'RED' && !confirm("¿Estás seguro de expulsar a este usuario definitivamente?")) return;
    
    setLoading(true);
    const toastId = toast.loading("Aplicando sanción...");

    try {
      const res = await fetch(`/api/admin/users/${user.id}/strike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al aplicar sanción");

      toast.success(data.message, { id: toastId });
      router.refresh(); // Recarga la lista desde el servidor
    } catch (error: unknown) {
      console.error("Error en strike:", error);
      toast.error(error instanceof Error ? error.message : "Error", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-[#1A1D24] border rounded-xl p-4 flex flex-col gap-3 w-full max-w-full overflow-hidden transition-colors ${user.isBanned ? 'border-red-900/50' : 'border-gray-800'}`}>
      
      {/* Cabecera del Usuario */}
      <div className="flex justify-between items-start gap-2 w-full">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white text-base truncate flex items-center gap-2">
            {user.name || "Sin nombre"}
            {user.isBanned && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Baneado</span>}
          </p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1 ${
          user.role === "ADMIN" ? "bg-orange-500/20 text-orange-500" : "bg-gray-800 text-gray-400"
        }`}>
          {user.role === "ADMIN" && <Shield className="w-3 h-3" />} {user.role}
        </span>
      </div>

      {/* Info Adicional */}
      <div className="grid grid-cols-3 gap-2 mt-1 w-full">
        <div className="bg-black/30 p-2 rounded-lg border border-gray-800/50 min-w-0">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Suscripción</p>
          {user.hasSub ? (
            <span className="text-green-500 font-bold text-xs flex items-center gap-1 truncate">
              <Crown className="w-3.5 h-3.5 shrink-0" /> Premium
            </span>
          ) : (
            <span className="text-gray-400 text-xs truncate">Gratis</span>
          )}
        </div>
        
        <div className="bg-black/30 p-2 rounded-lg border border-gray-800/50 min-w-0">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Último Pago</p>
          {user.lastTx ? (
            <span className="text-white font-semibold text-xs flex items-center gap-1 truncate">
              <Wallet className="w-3.5 h-3.5 text-orange-500 shrink-0" /> 
              <span className="truncate">${Number(user.lastTx.amount)}</span>
            </span>
          ) : (
            <span className="text-gray-500 text-xs truncate">Ninguno</span>
          )}
        </div>

        <div className="bg-black/30 p-2 rounded-lg border border-gray-800/50 min-w-0">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Sanciones</p>
          <div className="flex gap-1 mt-1">
            {user.strikes === 0 && <span className="text-gray-500 text-xs">Limpio</span>}
            {user.strikes >= 1 && <span className="w-3 h-4 rounded-sm bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>}
            {user.strikes >= 2 && <span className="w-3 h-4 rounded-sm bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>}
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      {!user.isBanned && (
        <div className="flex gap-2 mt-2 pt-3 border-t border-gray-800">
          <button 
            onClick={() => handleStrike('YELLOW')} 
            disabled={loading}
            className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" /> Amarilla
          </button>
          <button 
            onClick={() => handleStrike('RED')} 
            disabled={loading}
            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
          >
            <Ban className="w-4 h-4" /> Roja
          </button>
        </div>
      )}

    </div>
  );
}
