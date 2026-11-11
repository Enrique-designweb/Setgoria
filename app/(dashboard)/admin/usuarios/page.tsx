// app/(dashboard)/admin/usuarios/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AdminUserItem from "./AdminUserItem";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/inicio"); // 👈 Redirección corregida

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
          
          // 👇 Añadidos los campos que faltaban
          const formattedUser = {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            strikes: u.strikes,
            isBanned: u.isBanned,
            hasSub,
            lastTx: lastTx ? { amount: Number(lastTx.amount), method: lastTx.method } : null,
            kycStatus: u.kycStatus, // 👈 Añadido
            idCardUrl: u.idCardUrl  // 👈 Añadido
          };

          return <AdminUserItem key={u.id} user={formattedUser} />;
        })}
      </div>
    </div>
  );
}
