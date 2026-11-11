// app/(dashboard)/admin/usuarios/AdminUserItem.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Shield, Wallet, AlertTriangle, Ban, Eye, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface AdminUserItemProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string; // 👈 Cambiado a string para compatibilidad
    strikes: number;
    isBanned: boolean;
    hasSub: boolean;
    lastTx: { amount: number; method: string } | null;
    kycStatus: string; // 👈 Añadido
    idCardUrl: string | null; // 👈 Añadido
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
      router.refresh();
    } catch (error: unknown) { // 👈 Corregido aquí
      console.error("Error en strike:", error);
      toast.error(error instanceof Error ? error.message : "Error", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleKyc = async (action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`¿Estás seguro de ${action === 'APPROVE' ? 'APROBAR' : 'RECHAZAR'} este KYC?`)) return;
    
    setLoading(true);
    const toastId = toast.loading("Procesando KYC...");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Error al procesar KYC");
      toast.success("Estado de KYC actualizado", { id: toastId });
      router.refresh();
    } catch (error: unknown) { // 👈 Corregido aquí
      console.error("Error en KYC:", error);
      toast.error("Error al procesar", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-[#1A1D24] border rounded-xl p-4 flex flex-col gap-3 w-full max-w-full overflow-hidden transition-colors ${user.isBanned ? 'border-red-900/50' : 'border-gray-800'}`}>
      
      <div className="flex justify-between items-start gap-2 w-full">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white text-base truncate flex items-center gap-2">
            {user.name || "Sin nombre"}
            {user.isBanned && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Baneado</span>}
            {user.kycStatus === "APPROVED" && <Shield className="w-4 h-4 text-green-500" />}
          </p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1 ${user.role === "ADMIN" ? "bg-orange-500/20 text-orange-500" : "bg-gray-800 text-gray-400"}`}>
          {user.role}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-1 w-full">
        <div className="bg-black/30 p-2 rounded-lg border border-gray-800/50 min-w-0">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Suscripción</p>
          {user.hasSub ? (
            <span className="text-green-500 font-bold text-xs flex items-center gap-1 truncate"><Crown className="w-3.5 h-3.5 shrink-0" /> Premium</span>
          ) : (
            <span className="text-gray-400 text-xs truncate">Gratis</span>
          )}
        </div>
        
        <div className="bg-black/30 p-2 rounded-lg border border-gray-800/50 min-w-0">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Último Pago</p>
          {user.lastTx ? (
            <span className="text-white font-semibold text-xs flex items-center gap-1 truncate">
              {/* 👇 USANDO WALLET AQUÍ 👇 */}
              <Wallet className="w-3.5 h-3.5 text-orange-500 shrink-0" /> 
              <span className="truncate">${Number(user.lastTx.amount)}</span>
            </span>
          ) : (
            <span className="text-gray-500 text-xs truncate">Ninguno</span>
          )}
        </div>

        <div className="bg-black/30 p-2 rounded-lg border border-gray-800/50 min-w-0">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">KYC</p>
          <span className={`text-xs font-bold ${user.kycStatus === 'APPROVED' ? 'text-green-500' : user.kycStatus === 'PENDING' ? 'text-yellow-500' : 'text-gray-400'}`}>
            {user.kycStatus}
          </span>
        </div>
      </div>

      {/* ACCIONES DE KYC */}
      {user.kycStatus === "PENDING" && user.idCardUrl && (
        <div className="flex gap-2 mt-2 pt-3 border-t border-gray-800">
          <a href={user.idCardUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
            <Eye className="w-4 h-4" /> Ver Carnet
          </a>
          <button onClick={() => handleKyc('APPROVE')} disabled={loading} className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50">
            <CheckCircle className="w-4 h-4" /> Aprobar KYC
          </button>
        </div>
      )}

      {/* ACCIONES DE STRIKE */}
      {!user.isBanned && (
        <div className="flex gap-2 mt-2 pt-3 border-t border-gray-800">
          <button onClick={() => handleStrike('YELLOW')} disabled={loading} className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50">
            <AlertTriangle className="w-4 h-4" /> Amarilla
          </button>
          <button onClick={() => handleStrike('RED')} disabled={loading} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50">
            <Ban className="w-4 h-4" /> Roja
          </button>
        </div>
      )}
    </div>
  );
}
