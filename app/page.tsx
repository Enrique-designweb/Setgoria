// app/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, Lock, TrendingUp, ShieldCheck, Trophy } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  
  // Si ya está logueado, lo mandamos directo a su inicio privado
  if (session?.user) {
    redirect("/inicio"); 
  }

  return (
    <main className="min-h-screen bg-set-bg text-white overflow-hidden">
      {/* Navbar Público */}
      <nav className="fixed top-0 w-full p-4 flex justify-between items-center bg-black/50 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-xl font-black italic tracking-tighter">SETGORIA</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white px-4 py-2 transition-colors">
            Entrar
          </Link>
          <Link href="/login" className="text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-orange-500/20">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 text-center max-w-4xl mx-auto relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] -z-10"></div>
        
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tight uppercase mb-6 leading-tight">
          Domina los <span className="text-orange-500">Pronósticos</span> Deportivos
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Únete a la plataforma premium de fútbol y tenis. Predicciones con probabilidad, estadísticas en vivo y una comunidad ganadora.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95">
          <Trophy className="w-5 h-5" /> Empezar Ahora - 72 Horas Gratis
        </Link>
      </section>

      {/* Preview Bloqueado (Mockup) */}
      <section className="px-4 max-w-5xl mx-auto pb-20 relative">
        <div className="absolute inset-0 bg-linear-to-t from-set-bg via-set-bg/80 to-transparent z-10 h-full w-full"></div>
        
        <div className="flex flex-col gap-4 opacity-30 blur-[6px] pointer-events-none select-none">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-set-surface border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>CHAMPIONS LEAGUE</span>
                <span>HOY, 20:00</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold">Real Madrid</span>
                <span className="text-orange-500 font-black">VS</span>
                <span className="text-xl font-bold">Manchester City</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full w-full mb-2"></div>
              <div className="h-2 bg-gray-800 rounded-full w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Overlay Central de Bloqueo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div className="bg-set-surface border border-orange-500/30 p-6 rounded-2xl text-center max-w-sm shadow-2xl">
            <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Contenido Exclusivo</h3>
            <p className="text-sm text-gray-400 mb-6">Regístrate para desbloquear los pronósticos de hoy y ver las probabilidades reales.</p>
            <Link href="/login" className="w-full block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all active:scale-95">
              Desbloquear Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="px-4 max-w-4xl mx-auto py-16 border-t border-gray-800 relative z-10 bg-set-bg">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="font-bold mb-2">Alta Efectividad</h3>
            <p className="text-sm text-gray-400">Pronósticos analizados con las mejores probabilidades del mercado.</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="font-bold mb-2">Datos en Vivo</h3>
            <p className="text-sm text-gray-400">Sigue los marcadores y estadísticas minuto a minuto sin recargar.</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="font-bold mb-2">Pagos Seguros</h3>
            <p className="text-sm text-gray-400">Suscripciones flexibles con QvaPay, Transfermóvil y USDT.</p>
          </div>
        </div>
      </section>

      {/* Footer Público */}
      <footer className="text-center py-8 border-t border-gray-800/50 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} SETGORIA. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
