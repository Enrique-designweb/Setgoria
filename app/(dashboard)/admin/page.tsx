// app/(dashboard)/admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Shield, Plus, CreditCard, Users, Settings, Image as ImageIcon, ArrowRight } from "lucide-react";
import AdminMatchForm from "./AdminMatchForm";
import AdminMatchItem from "./AdminMatchItem";
import { Match, Prediction } from "@/src/generated/prisma/client";

type MatchWithPredictions = Match & { predictions: Prediction[] };

export default async function AdminPage() {
  const session = await auth();
  
  // 👈 Si no es admin, lo mandamos a /inicio, NO a / (que podría causar bucle)
  if (!session?.user || session.user.role !== "ADMIN") redirect("/inicio");

  const matches = (await prisma.match.findMany({
    include: { predictions: true },
    orderBy: { matchDate: 'desc' }
  })) as MatchWithPredictions[];

  const adminCards = [
    {
      title: "Gestionar Pagos",
      desc: "Aprobar QvaPay, Transfermóvil y USDT",
      href: "/admin/pagos",
      icon: CreditCard,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Ver Usuarios",
      desc: "Sanciones, tarjetas y cuentas",
      href: "/admin/usuarios",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Historias",
      desc: "Subir imágenes y videos a la Home",
      href: "/admin/historias",
      icon: ImageIcon,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Ajustes", // 👈 Renombrado
      desc: "Variables, sistema y mantenimiento",
      href: "/admin/ajustes", 
      icon: Settings,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-500/20 p-2 rounded-lg">
          <Shield className="text-orange-500 w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tight">
          Panel de Admin
        </h1>
      </div>

      {/* 👇 NUEVO GRID DE ADMIN 👇 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {adminCards.map((card) => (
          <Link 
            key={card.title} 
            href={card.href}
            className="bg-[#1A1D24] border border-gray-800 hover:border-orange-500/50 p-4 rounded-2xl flex flex-col transition-all group hover:-translate-y-1"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.bg} ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1 group-hover:text-orange-500 transition-colors">
              {card.title}
            </h2>
            <p className="text-[10px] text-gray-400 flex-1 leading-tight mb-3">
              {card.desc}
            </p>
            <div className="flex items-center text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors">
              Acceder <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
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
