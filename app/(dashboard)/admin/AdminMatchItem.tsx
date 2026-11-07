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
  Loader2
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

  const handleDelete = async () => {
    if (window.confirm(`⚠️ ¿Eliminar el partido ${match.homeTeam} vs ${match.awayTeam}?`)) {
      setIsDeleting(true);
      const toastId = toast.loading("Eliminando...");
      try {
        const res = await fetch(`/api/admin/matches/${match.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar");
        toast.success("Partido eliminado", { id: toastId });
        router.refresh();
      } catch (error: unknown) {
        console.error("Error eliminando partido:", error);
        toast.error("Error al eliminar el partido", { id: toastId });
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Guardando...");
    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setIsEditing(false);
      toast.success("Partido actualizado", { id: toastId });
      router.refresh();
    } catch (error: unknown) {
      console.error("Error actualizando partido:", error);
      toast.error("Error al actualizar", { id: toastId });
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
      toast.success("Pronóstico añadido", { id: toastId });
      router.refresh();
    } catch (error: unknown) {
      console.error("Error creando pronóstico:", error);
      toast.error("Error al añadir pronóstico", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResult = async (predId: string, result: "WON" | "LOST" | "PENDING") => {
    const toastId = toast.loading("Actualizando...");
    try {
      const res = await fetch(`/api/admin/predictions/${predId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      toast.success("Resultado guardado", { id: toastId });
      router.refresh();
    } catch (error: unknown) {
      console.error("Error actualizando resultado:", error);
      toast.error("Error al guardar resultado", { id: toastId });
    }
  };

  return (
    <div className={`bg-[#1A1D24] border transition-all duration-300 p-4 rounded-xl flex flex-col gap-3 ${
      isDeleting ? 'border-red-500/50 opacity-70' : 'border-gray-800'
    }`}>
      
      {/* Cabecera */}
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

      {/* Acciones */}
      <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-800/50">
        <div className="flex gap-1.5">
          <button onClick={() => setIsEditing(!isEditing)} disabled={isDeleting} className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all active:scale-95 disabled:opacity-50">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDelete} disabled={isDeleting} className={`p-1.5 rounded-lg transition-all active:scale-95 flex items-center justify-center ${isDeleting ? 'bg-red-500/20 text-red-500 cursor-not-allowed' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-orange-500/10 text-orange-500 text-[9px] font-bold px-2 py-1 rounded">
            {match.predictions.length} Pron.
          </span>
          <button onClick={() => setIsOpen(!isOpen)} disabled={isDeleting} className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-all active:scale-95 bg-orange-500/10 px-2 py-1 rounded-lg disabled:opacity-50">
            Añadir <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Lista de pronósticos compacta */}
      {match.predictions.length > 0 && (
        <div className="mt-1 pt-3 border-t border-gray-800/50">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Resultados</p>
          <div className="flex flex-col gap-1.5">
            {match.predictions.map((pred) => (
              <div key={pred.id} className="flex items-center justify-between bg-set-bg border border-gray-800/50 p-2 rounded-lg gap-2">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs text-white font-medium truncate flex items-center gap-1">
                    {pred.type} {pred.isPremium && <span className="text-orange-500 text-[10px]">👑</span>}
                  </span>
                  <span className="text-[9px] text-gray-500">{pred.probability}% Prob.</span>
                </div>
                
                <div className="flex items-center gap-0.5 shrink-0 bg-black/40 p-1 rounded-md border border-gray-800/50">
                  <button onClick={() => handleUpdateResult(pred.id, "WON")} className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${pred.result === 'WON' ? 'bg-green-500 text-white' : 'text-green-500 hover:bg-green-500/20'}`}>WON</button>
                  <button onClick={() => handleUpdateResult(pred.id, "LOST")} className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${pred.result === 'LOST' ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-500/20'}`}>LOST</button>
                  <button onClick={() => handleUpdateResult(pred.id, "PENDING")} className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${pred.result === 'PENDING' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>PEND</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formularios */}
      {isEditing && (
        <form onSubmit={handleEdit} className="mt-2 pt-4 border-t border-blue-500/20 grid grid-cols-1 gap-2.5 bg-blue-500/5 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-blue-400">Editando Partido</h4>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div><label className="text-[9px] font-bold text-gray-500 uppercase">Liga</label><input type="text" required value={editData.league} onChange={(e) => setEditData({ ...editData, league: e.target.value })} className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none" /></div>
          <div><label className="text-[9px] font-bold text-gray-500 uppercase">Fecha y Hora</label><input type="datetime-local" required value={editData.matchDate} onChange={(e) => setEditData({ ...editData, matchDate: e.target.value })} className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none scheme-dark" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-bold text-gray-500 uppercase">Local</label><input type="text" required value={editData.homeTeam} onChange={(e) => setEditData({ ...editData, homeTeam: e.target.value })} className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none" /></div>
            <div><label className="text-[9px] font-bold text-gray-500 uppercase">Visitante</label><input type="text" required value={editData.awayTeam} onChange={(e) => setEditData({ ...editData, awayTeam: e.target.value })} className="w-full mt-1 bg-set-bgrder border-gray-700 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none" /></div>
          </div>
          <button type="submit" disabled={loading} className="mt-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-xs transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
            <Save className="w-3.5 h-3.5" /> {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}

      {isOpen && (
        <form onSubmit={handleAddPrediction} className="mt-2 pt-4 border-t border-gray-800 grid grid-cols-1 gap-2.5 bg-black/20 p-3 rounded-lg">
          <div><label className="text-[9px] font-bold text-gray-500 uppercase">Pronóstico</label><input type="text" required placeholder="Ej. Más de 8.5 córners" className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-orange-500 outline-none" value={predData.type} onChange={(e) => setPredData({ ...predData, type: e.target.value })} /></div>
          <div className="flex gap-3">
            <div className="flex-1"><label className="text-[9px] font-bold text-gray-500 uppercase">Prob. (%)</label><input type="number" min="1" max="100" required className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-orange-500 outline-none" value={predData.probability} onChange={(e) => setPredData({ ...predData, probability: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-1.5 pt-4">
              <input type="checkbox" id={`premium-${match.id}`} className="w-3.5 h-3.5 accent-orange-500 rounded border-gray-700" checked={predData.isPremium} onChange={(e) => setPredData({ ...predData, isPremium: e.target.checked })} />
              <label htmlFor={`premium-${match.id}`} className="text-[10px] text-gray-300 font-medium cursor-pointer">Premium</label>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full mt-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? "Guardando..." : <><Plus className="w-3.5 h-3.5"/> Añadir</>}
          </button>
        </form>
      )}
    </div>
  );
}
