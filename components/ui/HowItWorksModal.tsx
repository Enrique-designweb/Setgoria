"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, CreditCard, Send, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: Props) {
  const steps = [
    { icon: UserPlus, title: "1. Regístrate", desc: "Crea tu cuenta en segundos y verifica tu edad." },
    { icon: CreditCard, title: "2. Activa Premium", desc: "Paga fácil con Transfermóvil, QvaPay o USDT." },
    { icon: Send, title: "3. Vincula Telegram", desc: "Conecta tu cuenta para recibir alertas y códigos." },
    { icon: TrendingUp, title: "4. Gana", desc: "Accede a pronósticos exclusivos y sigue las estadísticas." },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-0 z-101 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-set-surface w-full max-w-md rounded-3xl p-6 border border-gray-800 shadow-2xl pointer-events-auto relative overflow-hidden">
              
              {/* Brillo superior */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full"></div>

              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-6 text-center relative z-10">
                ¿Cómo funciona <span className="text-orange-500">Setgoria</span>?
              </h2>

              <div className="flex flex-col gap-4 relative z-10">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 bg-set-bg p-4 rounded-xl border border-gray-800">
                    <div className="bg-orange-500/10 p-2 rounded-lg shrink-0">
                      <step.icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{step.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link 
                href="/suscripcion" 
                onClick={onClose}
                className="mt-6 w-full block text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                Empezar ahora
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
