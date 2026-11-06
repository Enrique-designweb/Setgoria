"use client";

import Link from "next/link";
import { Lock, Zap } from "lucide-react";
import { motion } from "framer-motion"; // 👈 Importamos

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
        {/* 👈 Animamos el modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-[#14161d] border border-gray-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
          
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
            <Lock className="w-10 h-10 text-orange-500" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">Prueba Finalizada</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Tus 72 horas de acceso de prueba han terminado. Activa tu plan Premium para seguir viendo los pronósticos.
          </p>
          
          <Link href="/suscripcion" className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95">
            <Zap className="w-5 h-5" /> Desbloquear Acceso Total
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
