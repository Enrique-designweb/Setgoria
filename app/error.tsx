// app/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Error capturado:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-set-bg text-white p-4 text-center">
      <div className="bg-red-500/10 p-6 rounded-full mb-6">
        <AlertTriangle className="w-16 h-16 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Algo salió mal</h2>
      <p className="text-gray-400 mb-6 max-w-md">Hubo un problema de conexión o un error inesperado. Por favor, intenta de nuevo.</p>
      <button
        onClick={() => reset()}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 active:scale-95"
      >
        <RefreshCw className="w-5 h-5" /> Intentar de nuevo
      </button>
    </div>
  );
}
