// app/(dashboard)/admin/AdminMatchItem.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronDown, 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from "lucide-react";
import { Match, Prediction } from "../../../src/generated/prisma/client";
import { toast } from "sonner";

type MatchWithPredictions = Match & { predictions: Prediction[] };

export default function AdminMatchItem({ match }: { match: MatchWithPredictions }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [predData, setPredData] = useState({ type: "", probability: 50, isPremium: false });

  const [editData, setEditData] = useState({
    league: match.league,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    matchDate: new Date(match.matchDate).toISOString().slice(0, 16), 
  });

  // --- FUNCIONES ---

  const handleDelete = async () => {
    const confirmMessage = `⚠️ ¿Estás seguro de que deseas ELIMINAR el partido ${match.homeTeam} vs ${match.awayTeam}?\n\nEsta acción borrará también todos sus pronósticos y no se puede deshacer.`;
    
    if (window.confirm(confirmMessage)) {
      setIsDeleting(true);
      const toastId = toast.loading("Eliminando partido...");
      try {
        const res = await fetch(`/api/admin/matches/${match.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar");
        toast.success("Partido eliminado correctamente", { id: toastId });
        router.refresh();
      } catch (error: unknown) {
        console.error("Error eliminando partido:", error);
        toast.error("Hubo un error al eliminar el partido.", { id: toastId });
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Guardando cambios...");
    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setIsEditing(false);
      toast.success("Partido actualizado correctamente", { id: toastId });
      router.refresh();
    } catch (error: unknown) {
      console.error("Error actualizando partido:", error);
      toast.error("Hubo un error al actualizar el partido", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Añadiendo pronóstico...");
    try {
      const res = await fetch("/api/admin/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...predData, matchId: match.id }),
      });
      if (!res.ok) throw new Error("Error al crear pronóstico");
      setPredData({ type: "", probability: 50, isPremium: false });
      setIsOpen(false);
      toast.success("Pronóstico añadido con éxito", { id: toastId });
      router.refresh();
    } catch (error: unknown) {
      console.error("Error creando pronóstico:", error);
      toast.error("Error al añadir pronóstico", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // 👈 NUEVA FUNCIÓN: Actualizar el resultado del pronóstico
  const handleUpdateResult = async (predId: string, result: "WON" | "LOST" | "PENDING") => {
  const toastId = toast.loading("Actualizando resultado...");
  try {
    const res = await fetch(`/api/admin/predictions/${predId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }), // 'result' ya es un string válido
    });
    if (!res.ok) throw new Error("Error al actualizar");
    toast.success("Resultado guardado", { id: toastId });
    router.refresh();
  } catch (error: unknown) {
    console.error("Error actualizando resultado:", error);
    toast.error("Error al guardar el resultado", { id: toastId });
  }
};

  return (
    <div className={`bg-[#1A1D24] border transition-all duration-300 p-4 rounded-xl flex flex-col gap-4 ${
      isDeleting ? 'border-red-500/50 opacity-70' : 'border-gray-800'
    }`}>
      
      {/* Cabecera: Liga y Fecha */}
      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <span className="truncate pr-2">{match.league}</span>
        <span className="shrink-0">{new Date(match.matchDate).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
      </div>

      {/* Equipos */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex-1">
          <p className="text-white font-bold text-base leading-tight truncate">{match.homeTeam}</p>
        </div>
        <span className="text-orange-500 font-black text-xs px-2 shrink-0">VS</span>
        <div className="flex-1 text-right">
          <p className="text-white font-bold text-base leading-tight truncate">{match.awayTeam}</p>
        </div>
      </div>

      {/* Acciones (Editar, Eliminar, Añadir Pronóstico) */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-800/50">
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            disabled={isDeleting}
            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            title="Editar Partido"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center w-9 h-9 ${
              isDeleting ? 'bg-red-500/20 text-red-500 cursor-not-allowed' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }`}
            title="Eliminar Partido"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-1 rounded">
            {match.predictions.length} Pronósticos
          </span>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            disabled={isDeleting}
            className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-all active:scale-95 bg-orange-500/10 px-2 py-1.5 rounded-lg disabled:opacity-50"
          >
            Añadir <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* 👈 NUEVA SECCIÓN: Lista de pronósticos para marcar resultados */}
      {match.predictions.length > 0 && (
        <div className="mt-2 pt-4 border-t border-gray-800/50">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Resultados de Pronósticos</p>
          <div className="flex flex-col gap-2">
            {match.predictions.map((pred) => (
              <div key={pred.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#090a0e] border border-gray-800 p-3 rounded-lg gap-3">
                
                <div className="flex flex-col flex-1">
                  <span className="text-sm text-white font-medium flex items-center gap-1">
                    {pred.type} {pred.isPremium && <span className="text-orange-500 text-xs">👑</span>}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Probabilidad: {pred.probability}%</span>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => handleUpdateResult(pred.id, "WON")}
                    className={`px-2 py-1.5 rounded flex items-center gap-1 text-[10px] font-bold transition-all active:scale-95 ${
                      pred.result === 'WON' ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> WON
                  </button>
                  <button 
                    onClick={() => handleUpdateResult(pred.id, "LOST")}
                    className={`px-2 py-1.5 rounded flex items-center gap-1 text-[10px] font-bold transition-all active:scale-95 ${
                      pred.result === 'LOST' ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> LOST
                  </button>
                  <button 
                    onClick={() => handleUpdateResult(pred.id, "PENDING")}
                    className={`px-2 py-1.5 rounded flex items-center gap-1 text-[10px] font-bold transition-all active:scale-95 ${
                      pred.result === 'PENDING' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> PEND
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de Edición */}
      {isEditing && (
        <form onSubmit={handleEdit} className="mt-2 pt-4 border-t border-blue-500/20 grid grid-cols-1 gap-3 bg-blue-500/5 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-bold text-blue-400">Editando Partido</h4>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Liga</label>
            <input type="text" required value={editData.league} onChange={(e) => setEditData({ ...editData, league: e.target.value })}
              className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha y Hora</label>
            <input type="datetime-local" required value={editData.matchDate} onChange={(e) => setEditData({ ...editData, matchDate: e.target.value })}
              className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none scheme-dark" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Equipo Local</label>
            <input type="text" required value={editData.homeTeam} onChange={(e) => setEditData({ ...editData, homeTeam: e.target.value })}
              className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Equipo Visitante</label>
            <input type="text" required value={editData.awayTeam} onChange={(e) => setEditData({ ...editData, awayTeam: e.target.value })}
              className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" />
          </div>

          <button type="submit" disabled={loading} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      )}

      {/* Formulario de Añadir Pronóstico */}
      {isOpen && (
        <form onSubmit={handleAddPrediction} className="mt-2 pt-4 border-t border-gray-800 grid grid-cols-1 gap-3 bg-black/20 p-3 rounded-lg">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Pronóstico</label>
            <input type="text" required placeholder="Ej. Más de 8.5 córners"
              className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none"
              value={predData.type} onChange={(e) => setPredData({ ...predData, type: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Prob. (%)</label>
              <input type="number" min="1" max="100" required
                className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none"
                value={predData.probability} onChange={(e) => setPredData({ ...predData, probability: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id={`premium-${match.id}`} className="w-4 h-4 accent-orange-500"
                  checked={predData.isPremium} onChange={(e) => setPredData({ ...predData, isPremium: e.target.checked })} />
              <label htmlFor={`premium-${match.id}`} className="text-xs text-gray-300 font-medium cursor-pointer">Es Premium</label>
            </div>
          </div>
          
          <button type="submit" disabled={loading}
            className="w-full mt-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? "Guardando..." : <><Plus className="w-4 h-4"/> Añadir al Partido</>}
          </button>
        </form>
      )}
    </div>
  );
}
