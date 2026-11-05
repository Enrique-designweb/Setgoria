"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminMatchForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    league: "",
    homeTeam: "",
    awayTeam: "",
    matchDate: "",
    sport: "FUTBOL",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Creando partido...");

    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear el partido");
      }

      toast.success("Partido creado correctamente", { id: toastId });
      setFormData({ league: "", homeTeam: "", awayTeam: "", matchDate: "", sport: "FUTBOL" });
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error al crear el partido", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Liga</label>
        <input type="text" required value={formData.league} onChange={(e) => setFormData({...formData, league: e.target.value})}
          className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none" placeholder="Ej. Champions League" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha y Hora</label>
        <input type="datetime-local" required value={formData.matchDate} onChange={(e) => setFormData({...formData, matchDate: e.target.value})}
          className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none scheme-dark" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Equipo Local</label>
        <input type="text" required value={formData.homeTeam} onChange={(e) => setFormData({...formData, homeTeam: e.target.value})}
          className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none" placeholder="Ej. Real Madrid" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Equipo Visitante</label>
        <input type="text" required value={formData.awayTeam} onChange={(e) => setFormData({...formData, awayTeam: e.target.value})}
          className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none" placeholder="Ej. Barcelona" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Deporte</label>
        <select value={formData.sport} onChange={(e) => setFormData({...formData, sport: e.target.value})}
          className="w-full mt-1 bg-[#090a0e] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none">
          <option value="FUTBOL">Fútbol</option>
          <option value="TENIS">Tenis</option>
          <option value="BASQUETBOL">Básquetbol</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 
        {loading ? "Creando..." : "Crear Partido"}
      </button>
    </form>
  );
}
