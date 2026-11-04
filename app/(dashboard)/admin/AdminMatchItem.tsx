// app/(dashboard)/admin/AdminMatchItem.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { Match, Prediction } from "../../../src/generated/prisma/client";

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
    const confirmMessage = `⚠️ ¿Estás seguro de que deseas ELIMINAR el partido ${match.homeTeam} vs ${match.awayTeam}?\n\nEsta acción borrará también todos sus pronósticos y no se puede deshacer.`;
    
    if (window.confirm(confirmMessage)) {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/admin/matches/${match.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar");
        router.refresh();
      } catch (error) {
        // 👈 Usamos el error
        console.error("Error eliminando partido:", error);
        alert("Hubo un error al eliminar el partido. Intenta de nuevo.");
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      // 👈 Usamos el error
      console.error("Error actualizando partido:", error);
      alert("Hubo un error al actualizar el partido");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...predData, matchId: match.id }),
      });
      if (!res.ok) throw new Error("Error al crear pronóstico");
      setPredData({ type: "", probability: 50, isPremium: false });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      // 👈 Usamos el error
      console.error("Error creando pronóstico:", error);
      alert("Error al añadir pronóstico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-set-bg border transition-all duration-300 p-4 rounded-xl flex flex-col gap-4 ${
      isDeleting ? 'border-red-500/50 opacity-70' : 'border-gray-800'
    }`}>
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase">{match.league}</p>
          <p className="text-white font-bold text-lg">{match.homeTeam} vs {match.awayTeam}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(match.matchDate).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            disabled={isDeleting}
            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors disabled:opacity-50"
            title="Editar Partido"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center w-9 h-9 ${
              isDeleting 
                ? 'bg-red-500/20 text-red-500 cursor-not-allowed' 
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }`}
            title="Eliminar Partido"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>

          <div className="h-6 w-px bg-gray-700 mx-1"></div>
          <span className="bg-orange-500/10 text-orange-500 text-xs font-bold px-2 py-1 rounded">
            {match.predictions.length} Pronósticos
          </span>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            disabled={isDeleting}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors ml-2 disabled:opacity-50"
          >
            Añadir <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isEditing && (
        <form onSubmit={handleEdit} className="mt-2 pt-4 border-t border-blue-500/20 grid grid-cols-1 md:grid-cols-2 gap-3 bg-blue-500/5 p-4 rounded-lg">
          <div className="md:col-span-2 flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-blue-400">Editando Partido</h4>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Liga</label>
            <input type="text" required value={editData.league} onChange={(e) => setEditData({ ...editData, league: e.target.value })}
              className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha y Hora</label>
            <input type="datetime-local" required value={editData.matchDate} onChange={(e) => setEditData({ ...editData, matchDate: e.target.value })}
              className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none scheme-dark" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Equipo Local</label>
            <input type="text" required value={editData.homeTeam} onChange={(e) => setEditData({ ...editData, homeTeam: e.target.value })}
              className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Equipo Visitante</label>
            <input type="text" required value={editData.awayTeam} onChange={(e) => setEditData({ ...editData, awayTeam: e.target.value })}
              className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" />
          </div>

          <button type="submit" disabled={loading} className="md:col-span-2 mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      )}

      {isOpen && (
        <form onSubmit={handleAddPrediction} className="mt-2 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-set-surface p-3 rounded-lg">
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Pronóstico</label>
            <input type="text" required placeholder="Ej. Más de 8.5 córners"
              className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none"
              value={predData.type} onChange={(e) => setPredData({ ...predData, type: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Prob. (%)</label>
            <input type="number" min="1" max="100" required
              className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none"
              value={predData.probability} onChange={(e) => setPredData({ ...predData, probability: Number(e.target.value) })} />
          </div>
          <div className="flex items-center gap-2 h-full pb-2">
             <input type="checkbox" id={`premium-${match.id}`} className="w-4 h-4 accent-orange-500"
                checked={predData.isPremium} onChange={(e) => setPredData({ ...predData, isPremium: e.target.checked })} />
              <label htmlFor={`premium-${match.id}`} className="text-xs text-gray-300 font-medium cursor-pointer">Es Premium</label>
          </div>
          
          <button type="submit" disabled={loading}
            className="md:col-span-4 w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? "Guardando..." : <><Plus className="w-4 h-4"/> Añadir al Partido</>}
          </button>
        </form>
      )}
    </div>
  );
}
