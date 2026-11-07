// app/(dashboard)/admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Shield, Plus, CreditCard, Users, Settings } from "lucide-react";
import AdminMatchForm from "./AdminMatchForm";
import AdminMatchItem from "./AdminMatchItem";
import { Match, Prediction } from "@/src/generated/prisma/client"; // 👈 1. Importamos tipos

// 👈 2. Definimos el tipo exacto
type MatchWithPredictions = Match & { predictions: Prediction[] };

export default async function AdminPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  // 👈 3. Forzamos a TypeScript a saber que esto es un arreglo de MatchWithPredictions
  const matches = (await prisma.match.findMany({
    include: { predictions: true },
    orderBy: { matchDate: 'desc' }
  })) as MatchWithPredictions[];

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-500/20 p-2 rounded-lg">
          <Shield className="text-orange-500 w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tight">
          Panel de Admin
        </h1>
      </div>

      {/* 👈 Accesos Rápidos para Móvil */}
      <div className="grid grid-cols-2 md:hidden gap-3 mb-8">
        <Link href="/admin/pagos" className="bg-set-surface border border-gray-800 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2">
          <CreditCard className="w-6 h-6 text-orange-500" />
          <span className="text-xs font-bold">Gestionar Pagos</span>
        </Link>
        <Link href="/admin/usuarios" className="bg-set-surface border border-gray-800 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2">
          <Users className="w-6 h-6 text-orange-500" />
          <span className="text-xs font-bold">Ver Usuarios</span>
        </Link>
        <Link href="/configuracion" className="bg-set-surface border border-gray-800 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 col-span-2">
          <Settings className="w-6 h-6 text-orange-500" />
          <span className="text-xs font-bold">Configuración Global</span>
        </Link>
      </div>

      {/* Botones para PC (Desktop) */}
      <div className="hidden md:flex items-center gap-2 mb-8">
        <Link href="/admin/usuarios" className="bg-set-surface hover:bg-gray-800 border border-gray-700 text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg">
          <Users className="w-4 h-4 text-orange-500" /> Usuarios
        </Link>
        <Link href="/admin/pagos" className="bg-set-surface hover:bg-gray-800 border border-gray-700 text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg">
          <CreditCard className="w-4 h-4 text-orange-500" /> Gestionar Pagos
        </Link>
      </div>

      {/* Layout Responsive (Columna en móvil, fila en PC) */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        
        {/* Formulario */}
        <div className="w-full md:w-1/3">
          <div className="bg-set-surface border border-gray-800 rounded-2xl p-5 md:p-6 md:sticky md:top-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" /> Nuevo Partido
            </h2>
            <AdminMatchForm />
          </div>
        </div>

        {/* Lista de Partidos */}
        <div className="w-full md:w-2/3">
          <div className="bg-set-surface border border-gray-800 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-bold text-white mb-4">Partidos en la Plataforma</h2>
            
            {matches.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay partidos creados aún.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {matches.map((match) => (
                  <AdminMatchItem key={match.id} match={match} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
