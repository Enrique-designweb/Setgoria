// app/(dashboard)/layout.tsx
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import WelcomeModal from "@/components/ui/WelcomeModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* 1. SIDEBAR (PC) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-set-border bg-set-surface h-full z-50">
        <Sidebar />
      </aside>

      {/* 2. CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* 3. BOTTOM NAV (Móvil) */}
      <div className="md:hidden fixed bottom-0 w-full z-50 bg-set-surface border-t border-set-border">
        <BottomNav />
      </div>

      {/* 4. MODAL DE BIENVENIDA */}
      <WelcomeModal />
    </div>
  );
}
