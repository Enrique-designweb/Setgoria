// components/ui/InstallPwaBanner.tsx
"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPwaBanner() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false); // Empieza en false

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // 👇 SOLUCIÓN REACT 19: Usamos setTimeout para evitar el renderizado en cascada
    const timer = setTimeout(() => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
        setIsVisible(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  if (!supportsPWA || !isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-90 bg-[#1A1D24] border border-orange-500/50 p-3 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="bg-orange-500/20 p-2 rounded-xl">
          <Download className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Instala Setgoria</p>
          <p className="text-[10px] text-gray-400">Más rápida y sin navegador</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setIsVisible(false)} className="p-1 text-gray-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            promptInstall?.prompt();
            setIsVisible(false);
          }}
          className="bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-lg active:scale-95 transition-all"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}
