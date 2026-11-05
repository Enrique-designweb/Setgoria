"use client";

import Link from "next/link";
import { Lock, Zap } from "lucide-react";

interface Props {
  isExpired: boolean; 
  children: React.ReactNode;
}

export default function SubscriptionGate({ isExpired, children }: Props) {
  if (!isExpired) return <>{children}</>;

  return (
    <div className="relative min-h-screen">
      <div className="opacity-20 pointer-events-none blur-sm select-none">
        {children}
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-[#14161d] border border-gray-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>

          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
            <Lock className="w-10 h-10 text-orange-500" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">
            Prueba Finalizada
          </h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Tus 72 horas de acceso de prueba han terminado. Para seguir viendo los pronósticos exclusivos y estadísticas en vivo, activa tu plan Premium.
          </p>

          <div className="bg-[#090a0e] border border-gray-800 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 font-medium">Plan Semanal</span>
              <span className="text-orange-500 font-bold text-lg">$0.10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Plan Mensual</span>
              <span className="text-orange-500 font-bold text-lg">$24.00</span>
            </div>
          </div>

          <Link
            href="/suscripcion"
            className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20"
          >
            <Zap className="w-5 h-5" />
            Desbloquear Acceso Total
          </Link>
        </div>
      </div>
    </div>
  );
}
