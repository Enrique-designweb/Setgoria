// app/(dashboard)/historial/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";

export default async function HistorialPage() {
  const session = await auth();
  const transactions = await prisma.transaction.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-black italic text-orange-500 uppercase mb-8">Mi Historial</h1>
      
      {transactions.length === 0 ? (
        <p className="text-gray-400">No tienes transacciones registradas aún.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-set-surface border border-gray-800 p-4 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* 👈 Usamos CreditCard aquí */}
                <div className="bg-white/5 p-3 rounded-lg">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-white">Plan {tx.plan}</p>
                  <p className="text-xs text-gray-400 capitalize">{tx.method.toLowerCase()} • {tx.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-400">${Number(tx.amount)} {tx.currency}</p>
                <span className={`text-[10px] font-bold px-2 py-1 rounded mt-1 inline-flex items-center gap-1 ${
                  tx.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 
                  tx.status === 'PENDING_REVIEW' ? 'bg-yellow-500/10 text-yellow-500' : 
                  'bg-red-500/10 text-red-500' // 👈 Color rojo para fallidos
                }`}>
                  {/* 👈 Usamos XCircle aquí */}
                  {tx.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3" /> : 
                   tx.status === 'PENDING_REVIEW' ? <Clock className="w-3 h-3" /> : 
                   <XCircle className="w-3 h-3" />}
                  {tx.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
