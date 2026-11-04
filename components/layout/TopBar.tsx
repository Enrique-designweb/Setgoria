// components/layout/TopBar.tsx
"use client";

import Link from "next/link";
import { Zap, User, LogOut, Crown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import NotificationBell from "./NotificationBell";

export default function TopBar() {
  const { data: session, status } = useSession();

  const calculateTrialTime = () => {
    if (!session?.user?.createdAt) return "Calculando...";
    const now = new Date();
    const created = new Date(session.user.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const remainingHours = 72 - diffHours;
    if (remainingHours <= 0) return "Prueba expirada";
    return `${remainingHours}h restantes`;
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-8 border-b border-gray-800/50 bg-set-bg">
      <div className="flex items-center gap-2 md:hidden">
        <div className="bg-orange-500 p-1 rounded-md">
          <Zap className="text-white w-4 h-4 fill-white" />
        </div>
        <span className="text-lg font-black italic tracking-tighter text-white">SETGORIA</span>
      </div>

      <div className="hidden md:block"></div>

      <div className="flex items-center gap-3">
        {status === "loading" ? (
          <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse"></div>
        ) : session ? (
          <>
            {/* Badge de Premium o Trial */}
            {session.user.isPremium ? (
              <div className="hidden sm:flex items-center text-xs font-bold px-3 py-1.5 rounded-full border bg-yellow-500/10 border-yellow-500/30 text-yellow-500">
                <Crown className="w-3.5 h-3.5 mr-1.5" /> PREMIUM
              </div>
            ) : (
              <div className={`hidden sm:flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${
                calculateTrialTime() === "Prueba expirada" 
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-orange-500/10 border-orange-500/30 text-orange-400"
              }`}>
                ⏳ {calculateTrialTime()}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <NotificationBell />

              <Link 
                href="/perfil"
                className="flex items-center justify-center p-2 bg-set-surface border border-gray-700 rounded-full text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                title="Mi Perfil"
              >
                <User className="w-5 h-5" />
              </Link>

              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center justify-center p-2 bg-set-surface border border-gray-700 rounded-full text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">
              Crear cuenta
            </Link>
            <Link href="/login" className="p-2 bg-set-surface border border-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
