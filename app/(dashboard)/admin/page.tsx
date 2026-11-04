// app/(dashboard)/admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Shield, Plus, CreditCard, Users, Download } from "lucide-react";
import AdminMatchForm from "./AdminMatchForm";
import AdminMatchItem from "./AdminMatchItem";

export default async function AdminPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const matches = await prisma.match.findMany({
    include: { predictions: true },
    orderBy: { matchDate: 'desc' }
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            {/* 👈 Shield usado aquí */}
            <Shield className="text-orange-500 w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tight">
            Panel de Administrador
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <a 
            href="/api/admin/reports/transactions?format=csv"
            className="bg-[#14161d] hover:bg-gray-800 border border-gray-700 text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4 text-orange-500" />
            Reportes
          </a>
          <Link 
            href="/admin/usuarios"
            className="bg-set-surface hover:bg-gray-800 border border-gray-700 text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Users className="w-4 h-4 text-orange-500" />
            Usuarios
          </Link>
          <Link 
            href="/admin/pagos"
            className="bg-set-surface hover:bg-gray-800 border border-gray-700 text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <CreditCard className="w-4 h-4 text-orange-500" />
            Gestionar Pagos
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-set-surface border border-gray-800 rounded-2xl p-6 sticky top-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" /> Nuevo Partido
            </h2>
            <AdminMatchForm />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-set-surface border border-gray-800 rounded-2xl p-6">
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
