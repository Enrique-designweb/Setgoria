// components/layout/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, Crown, User, LayoutDashboard, CreditCard, TrendingUp } from "lucide-react";
import { clsx } from "clsx";

interface BottomNavProps {
  isAdmin: boolean;
}

export default function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname();

  const userNavItems = [
    { name: "Inicio", href: "/inicio", icon: Home },
    { name: "Fútbol", href: "/futbol", icon: Zap },
    { name: "Stats", href: "/estadisticas", icon: TrendingUp },
    { name: "Premium", href: "/suscripcion", icon: Crown },
    { name: "Perfil", href: "/perfil", icon: User },
  ];

  const adminNavItems = [
    { name: "Inicio", href: "/inicio", icon: Home },
    { name: "Panel", href: "/admin", icon: LayoutDashboard },
    { name: "Pagos", href: "/admin/pagos", icon: CreditCard },
    { name: "Stats", href: "/estadisticas", icon: TrendingUp },
    { name: "Perfil", href: "/perfil", icon: User },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    // 👈 fixed bottom-0 left-0 right-0 para anclar la barra al fondo de la pantalla
    // bg-[#090a0e]/95 backdrop-blur-md para darle ese toque de app nativa (QvaPay style)
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-set-bg/95 backdrop-blur-md border-t border-gray-800 pb-safe">
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
    </div>
  );
}
