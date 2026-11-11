// app/(dashboard)/referidos/page.tsx
"use client"; // 👈 Lo hacemos cliente para poder usar el botón de copiar

import { useState, useEffect } from "react";
import { Gift, Users, Copy, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ReferidosPage() {
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<{ id: string, name: string | null, createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Asumimos que /api/user devuelve el referralCode y la lista de referidos
    fetch("/api/user/referrals") 
      .then(res => res.json())
      .then(data => {
        setReferralCode(data.referralCode || "");
        setReferrals(data.referrals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/login?ref=${referralCode}`);
    setCopied(true);
    toast.success("¡Enlace de invitación copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Cargando referidos...</div>;

  const totalReferidos = referrals.length;
  const diasGanados = totalReferidos * 3;

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto text-white pb-24">
      
      {/* Botón Volver */}
      <Link href="/inicio" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black italic text-orange-500 uppercase mb-2 flex items-center gap-2">
          <Gift className="w-8 h-8" /> Invita y Gana
        </h1>
        <p className="text-gray-400 text-sm">Comparte tu enlace y gana 3 días de suscripción premium por cada amigo que se registre.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1A1D24] border border-gray-800 p-6 rounded-2xl flex flex-col items-center text-center">
          <Users className="w-10 h-10 text-blue-500 mb-3" />
          <h2 className="text-3xl font-black">{totalReferidos}</h2>
          <p className="text-xs text-gray-400 uppercase font-bold">Amigos Invitados</p>
        </div>
        <div className="bg-[#1A1D24] border border-gray-800 p-6 rounded-2xl flex flex-col items-center text-center">
          <Gift className="w-10 h-10 text-orange-500 mb-3" />
          <h2 className="text-3xl font-black text-orange-500">{diasGanados} Días</h2>
          <p className="text-xs text-gray-400 uppercase font-bold">Premium Ganados</p>
        </div>
        <div className="bg-[#1A1D24] border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative">
          <p className="text-xs text-gray-400 mb-3 uppercase font-bold">Tu Código</p>
          <code className="bg-black/50 text-green-400 font-mono px-4 py-2 rounded-lg text-sm w-full truncate text-center select-all mb-3">
            {referralCode}
          </code>
          {/* 👇 USAMOS EL ICONO COPY AQUÍ */}
          <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Tus Referidos</h2>
      <div className="bg-[#1A1D24] border border-gray-800 rounded-2xl overflow-hidden">
        {totalReferidos === 0 ? (
          <p className="p-6 text-gray-500 text-center text-sm">Aún no has invitado a nadie. ¡Comparte tu enlace!</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {referrals.map((ref) => (
              <div key={ref.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{ref.name || "Usuario Anónimo"}</p>
                  <p className="text-[10px] text-gray-500">Se unió el {new Date(ref.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">+3 Días</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
