// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
// 👈 Añadimos LayoutDashboard a los imports
import { Home, Zap, Trophy, Users, Crown, BarChart2, Shield, Info, Settings, LayoutDashboard } from "lucide-react";
import { clsx } from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Menú base para todos los usuarios
  const menuItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Fútbol", href: "/futbol", icon: Zap },
    { name: "Tenis", href: "/tenis", icon: Trophy },
    { name: "Comunidad", href: "/comunidad", icon: Users },
    { name: "Pronósticos", href: "/pronosticos", icon: BarChart2 },
    { name: "Mi suscripción", href: "/suscripcion", icon: Crown },
    { name: "Historial", href: "/historial", icon: Shield },
    { name: "Términos", href: "/terminos", icon: Info },
  ];

  // 👈 Si el usuario es ADMIN, le añadimos el enlace al panel
  if (session?.user?.role === "ADMIN") {
    menuItems.push({ name: "Admin Panel", href: "/admin", icon: LayoutDashboard });
    // Nota: Si quieres que "Configuración" también sea exclusivo de admin, puedes quitarlo del menú base y ponerlo aquí.
    menuItems.push({ name: "Configuración", href: "/configuracion", icon: Settings });
  }

  return (
    <div className="flex flex-col h-full w-full py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="bg-orange-500 p-1.5 rounded-lg">
          <Zap className="text-white w-5 h-5 fill-white" />
        </div>
        <span className="text-xl font-black italic tracking-tighter text-white">SETGORIA</span>
      </div>

      {/* Menú */}
      <nav className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-orange-500/10 text-orange-500" 
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
