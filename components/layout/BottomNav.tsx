'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, Trophy, Users, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileMenu = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Fútbol', href: '/futbol', icon: Zap },
  { name: 'Tenis', href: '/tenis', icon: Trophy },
  { name: 'Comunidad', href: '/comunidad', icon: Users },
  { name: 'Premium', href: '/suscripcion', icon: Crown },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0b0c10]/95 backdrop-blur-xl border-t border-set-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-2">
        {mobileMenu.map((item) => (
          <Link key={item.name} href={item.href} className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", pathname === item.href ? "text-set-accent" : "text-set-muted")}>
            <item.icon size={20} className={pathname === item.href ? "fill-set-accent/20" : ""} />
            <span className="text-[10px] font-bold">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
