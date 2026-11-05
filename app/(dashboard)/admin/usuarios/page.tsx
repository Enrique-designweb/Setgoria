import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, ArrowLeft, Crown, Shield, Wallet, Search } from "lucide-react";
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
    take: 50, // ✅ límite
  });

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="p-2 bg-[#1A1D24] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black italic text-white uppercase flex items-center gap-2">
          <Users className="text-orange-500 w-6 h-6" /> Gestión de Usuarios
        </h1>
      </div>

      {/* Buscador (GET form → URL) */}
      <form method="GET" className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            name="q"
            defaultValue={search}
            placeholder="Buscar por nombre o email..."
            className="w-full bg-[#1A1D24] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </form>

      <div className="flex flex-col gap-4">
        {users.length === 0 && (
          <div className="text-center text-gray-400 py-10">Sin resultados</div>
        )}
        {users.map((u) => {
          const hasSub = u.subscriptions.length > 0;
          const lastTx = u.transactions[0];
          return (
            <div key={u.id} className="bg-[#1A1D24] border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white text-lg truncate">{u.name || "Sin nombre"}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className={`ml-2 shrink-0 text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1 ${
                  u.role === "ADMIN" ? "bg-orange-500/20 text-orange-500" : "bg-gray-800 text-gray-400"
                }`}>
                  {u.role === "ADMIN" && <Shield className="w-3 h-3" />} {u.role}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 p-2 rounded-lg border border-gray-800/50">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Suscripción</p>
                  {hasSub ? (
                    <span className="text-green-500 font-bold text-sm flex items-center gap-1">
                      <Crown className="w-4 h-4" /> Premium
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Gratis</span>
                  )}
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-gray-800/50">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Último Pago</p>
                  {lastTx ? (
                    <span className="text-white font-semibold text-sm flex items-center gap-1 truncate">
                      <Wallet className="w-4 h-4 text-orange-500 shrink-0" />
                      ${Number(lastTx.amount)} ({lastTx.method})
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">Sin pagos</span>
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
