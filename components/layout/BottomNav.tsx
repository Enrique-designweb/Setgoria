// components/layout/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
// 👈 Aquí eliminamos "Users" de la importación
import { Home, Zap, Crown, User, LayoutDashboard, CreditCard, TrendingUp } from "lucide-react"; 
import { clsx } from "clsx";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Menú para usuarios normales
  const userNavItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Fútbol", href: "/futbol", icon: Zap },
    { name: "Stats", href: "/estadisticas", icon: TrendingUp },
    { name: "Premium", href: "/suscripcion", icon: Crown },
    { name: "Perfil", href: "/perfil", icon: User },
  ];

  // Menú exclusivo para el ADMIN
  const adminNavItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Panel", href: "/admin", icon: LayoutDashboard },
    { name: "Pagos", href: "/admin/pagos", icon: CreditCard },
    { name: "Stats", href: "/estadisticas", icon: TrendingUp },
    { name: "Perfil", href: "/perfil", icon: User },
  ];

  const navItems = session?.user?.role === "ADMIN" ? adminNavItems : userNavItems;

  return (
    <nav className="flex justify-around items-center h-16 w-full px-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive ? "text-orange-500" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <item.icon className={clsx("w-5 h-5", isActive && "fill-orange-500/20")} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
