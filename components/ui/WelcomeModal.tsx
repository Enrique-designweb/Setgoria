// components/ui/WelcomeModal.tsx
"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Zap } from "lucide-react";

// Función de suscripción vacía (no necesitamos escuchar cambios en tiempo real)
const subscribe = () => () => {};

export default function WelcomeModal() {
  // 1. Estado local para saber si el usuario acaba de cerrar el modal
  const [dismissed, setDismissed] = useState(false);

  // 2. Leemos localStorage de forma segura (adiós useEffect y adiós errores)
  const hasSeenOnboarding = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("setgoria_onboarding") === "true", // En el navegador
    () => true // En el servidor (asumimos true para evitar errores de hidratación)
  );

  // El modal se abre si no lo ha visto Y no lo acaba de cerrar
  const isOpen = !hasSeenOnboarding && !dismissed;

  const handleClose = () => {
    localStorage.setItem("setgoria_onboarding", "true");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100lex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-set-surface border border-gray-700 w-full max-w-lg rounded-2xl p-8 relative overflow-hidden"
          >
            {/* Adorno de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />

            <div className="text-center mb-8 relative z-10">
              <div className="bg-orange-500 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                <Zap className="text-white w-8 h-8 fill-white" />
              </div>
              <h2 className="text-2xl font-black italic text-white uppercase">Bienvenido a SETGORIA</h2>
              <p className="text-gray-400 text-sm mt-2">Tu viaje en los pronósticos deportivos comienza aquí.</p>
            </div>

            <div className="flex flex-col gap-4 mb-8 relative z-10">
              <div className="flex items-start gap-4 bg-set-bg p-4 rounded-xl border border-gray-800">
                <Trophy className="text-cyan-400 w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-white font-bold text-sm">Pronósticos Reales</h3>
                  <p className="text-gray-400 text-xs mt-1">Analizamos las estadísticas para darte las probabilidades más altas del mercado.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-set-bg p-4 rounded-xl border border-gray-800">
                <Crown className="text-orange-500 w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-white font-bold text-sm">Tienes 72 Horas de Prueba</h3>
                  <p className="text-gray-400 text-xs mt-1">Disfruta del acceso completo a la plataforma. Mira el contador en la parte superior.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors relative z-10"
            >
              Entendido, ¡vamos a ganar!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
