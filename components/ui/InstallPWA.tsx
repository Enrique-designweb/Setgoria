// components/ui/InstallPWA.tsx
"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

// 👇 SOLUCIÓN AL 'ANY': Creamos una interfaz para el evento
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  // 👇 Usamos nuestro tipo personalizado en lugar de 'any'
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!promptInstall) return;
    promptInstall.prompt();
  };

  if (!supportsPWA) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all mt-4"
    >
      <Download className="w-5 h-5" /> Instalar Setgoria en mi teléfono
    </button>
  );
}
