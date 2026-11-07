// app/(dashboard)/admin/usuarios/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, ArrowLeft, Crown, Shield, Wallet } from "lucide-react";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const { q = "" } = await searchParams;
  const search = q.trim();

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    include: {
      subscriptions: {
        where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
        orderBy: { expiresAt: "desc" },
        take: 1,
      },
      transactions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto pb-24 w-full overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="p-2 bg-[#1A1D24] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black italic text-white uppercase flex items-center gap-2">
          <Users className="text-orange-500 w-6 h-6" /> Gestión de Usuarios
        </h1>
      </div>

      {/* Buscador (Opcional si lo quieres mantener, si no, se puede quitar) */}
      <form method="GET" className="mb-6">
        <div className="relative">
          <input
            name="q"
            defaultValue={search}
            placeholder="Buscar por nombre o email..."
            className="w-full bg-[#1A1D24] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </form>

      <div className="flex flex-col gap-4 w-full">
        {users.length === 0 && (
          <div className="text-center text-gray-400 py-10">Sin resultados</div>
        )}
        
        {users.map((u) => {
          const hasSub = u.subscriptions.length > 0;
          const lastTx = u.transactions[0];
          
          return (
            // 👈 max-w-full y overflow-hidden para evitar desbordes
            <div key={u.id} className="bg-[#1A1D24] border border-gray-800 rounded-xl p-4 flex flex-col gap-3 w-full max-w-full overflow-hidden">
              
              {/* Cabecera del Usuario */}
              <div className="flex justify-between items-start gap-2 w-full">
                {/* 👈 min-w-0 permite que los textos se corten con "..." en lugar de empujar el diseño */}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white text-base truncate">{u.name || "Sin nombre"}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1 ${
                  u.role === "ADMIN" ? "bg-orange-500/20 text-orange-500" : "bg-gray-800 text-gray-400"
                }`}>
                  {u.role === "ADMIN" && <Shield className="w-3 h-3" />} {u.role}
                </span>
              </div>

              {/* Info Adicional */}
              <div className="grid grid-cols-2 gap-2 mt-1 w-full">
                <div className="bg-black/30 p-2 rounded-lg border border-gray-800/50 min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Suscripción</p>
                  {hasSub ? (
                    <span className="text-green-500 font-bold text-xs flex items-center gap-1 truncate">
                      <Crown className="w-3.5 h-3.5 shrink-0" /> Premium
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs truncate">Usuario Gratis</span>
                  )}
                </div>
                
                <div className="bg-black/30 p-2 rounded-lg border border-gray-800/50 min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Último Pago</p>
                  {lastTx ? (
                    <span className="text-white font-semibold text-xs flex items-center gap-1 truncate">
                      <Wallet className="w-3.5 h-3.5 text-orange-500 shrink-0" /> 
                      <span className="truncate">${Number(lastTx.amount)} ({lastTx.method})</span>
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs truncate">Sin pagos</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
