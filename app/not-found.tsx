// app/not-found.tsx
import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-set-bg text-white p-4 text-center">
      <div className="bg-orange-500/10 p-6 rounded-full mb-6">
        <AlertTriangle className="w-16 h-16 text-orange-500" />
      </div>
      <h1 className="text-6xl font-black italic text-orange-500 mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
      <p className="text-gray-400 max-w-md mb-8">
        La URL que buscas no existe o ha sido movida. Vuelve al inicio para seguir explorando los pronósticos.
      </p>
      <Link
        href="/inicio"
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 active:scale-95"
      >
        <Home className="w-5 h-5" /> Volver al Inicio
      </Link>
    </div>
  );
}
