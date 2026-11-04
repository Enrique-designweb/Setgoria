// app/(dashboard)/admin/usuarios/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, ArrowLeft, Crown, Shield } from "lucide-react"; // 👈 Shield se mantiene en la importación
import Link from "next/link";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    include: {
      subscriptions: {
        where: { status: "ACTIVE", expiresAt: { gt: new Date() } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 bg-set-surface border border-gray-800 rounded-lg hover:text-white text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black italic text-white uppercase flex items-center gap-2">
          <Users className="text-orange-500 w-6 h-6" /> Gestión de Usuarios
        </h1>
      </div>

      <div className="bg-set-surface border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-set-bg text-xs uppercase text-gray-400 border-b border-gray-800">
            <tr>
              <th className="p-4">Usuario</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Suscripción</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const hasSub = u.subscriptions.length > 0;
              return (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-white/5">
                  <td className="p-4">
                    <p className="font-bold text-white">{u.name || "Sin nombre"}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1 ${
                      u.role === 'ADMIN' ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {/* 👈 Usamos Shield aquí si es ADMIN */}
                      {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {hasSub ? (
                      <span className="text-green-500 font-bold text-xs flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Premium Activo
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">Usuario Gratis</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
