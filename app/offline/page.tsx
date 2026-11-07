import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-set-bg">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-3xl font-black text-white mb-3">Sin conexión</h1>
        <p className="text-gray-400 mb-6">
          No hay conexión a internet. Revisa tu red y vuelve a intentarlo.
        </p>
        <Link
          href="/"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg transition"
        >
          Reintentar
        </Link>
      </div>
    </div>
  );
}
