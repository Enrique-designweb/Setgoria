// components/layout/TopBar.tsx
"use client";

import { useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import NotificationBell from "./NotificationBell"; 

export default function TopBar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="h-16 border-b border-gray-800 flex items-center justify-between px-4 md:px-6 bg-[#090a0e]/80 backdrop-blur-md sticky top-0 z-40">
      
      {/* Logo en móvil */}
      <div className="md:hidden flex items-center gap-2">
        {/* Aquí puedes poner tu logo si quieres que se vea en móvil */}
      </div>

      <div className="flex items-center gap-4 ml-auto">
        
        {/* 👈 CONTADOR DE PRUEBA: Oculto en Admin y oculto en móviles muy pequeños */}
        {!isAdmin && (
          <div className="hidden sm:flex bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold px-3 py-1.5 rounded-lg items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Prueba Activa
          </div>
        )}

        {/* Campana de Notificaciones */}
        <NotificationBell />

        {/* Perfil */}
        <Link href="/perfil" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <User className="w-5 h-5" />
        </Link>

        {/* Cerrar Sesión */}
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-gray-400 hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
