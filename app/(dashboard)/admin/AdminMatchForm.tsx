// app/(dashboard)/admin/AdminMatchForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminMatchForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    league: "",
    homeTeam: "",
    awayTeam: "",
    matchDate: "",
    sport: "FUTBOL", // 👈 Nuevo campo por defecto
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al crear partido");
      }

      setMessage("¡Partido creado con éxito!");
      setFormData({ league: "", homeTeam: "", awayTeam: "", matchDate: "", sport: "FUTBOL" });
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* 👈 SELECT DE DEPORTE */}
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Deporte</label>
        <select
          required
          className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 outline-none"
          value={formData.sport}
          onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
        >
          <option value="FUTBOL">⚽ Fútbol</option>
          <option value="TENIS">🎾 Tenis</option>
        </select>
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Liga / Torneo</label>
        <input
          type="text" required placeholder="Ej. Premier League"
          className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 outline-none"
          value={formData.league}
          onChange={(e) => setFormData({ ...formData, league: e.target.value })}
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Equipo Local</label>
        <input
          type="text" required placeholder="Ej. Real Madrid"
          className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 outline-none"
          value={formData.homeTeam}
          onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Equipo Visitante</label>
        <input
          type="text" required placeholder="Ej. Barcelona"
          className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 outline-none"
          value={formData.awayTeam}
          onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha y Hora</label>
        <input
          type="datetime-local" required
          className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 outline-none scheme-dark"
          value={formData.matchDate}
          onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
        />
      </div>

      {message && (
        <p className={`text-xs font-bold text-center ${message.includes("éxito") ? "text-green-500" : "text-red-500"}`}>
          {message}
        </p>
      )}

      <button
        type="submit" disabled={loading}
        className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear Partido"}
      </button>
    </form>
  );
}
