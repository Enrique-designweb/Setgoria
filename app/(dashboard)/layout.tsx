// app/(dashboard)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import SubscriptionGate from "@/components/ui/SubscriptionGate";
import InstallPwaBanner from "@/components/ui/InstallPwaBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Obtenemos los datos del usuario de la BD
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { createdAt: true, role: true },
  });

  const isAdmin = user?.role === "ADMIN"; 

  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
  });

  const hasActiveSubscription = !!activeSub;

  const now = new Date().getTime(); 
  const trialExpiresAt = user ? new Date(user.createdAt).getTime() + 72 * 60 * 60 * 1000 : 0;
  const isTrialExpired = now > trialExpiresAt;

  const shouldBlock = !isAdmin && isTrialExpired && !hasActiveSubscription;

  return (
    // 👇 Aseguramos que ocupe toda la pantalla y no haya desbordes
    <div className="flex min-h-screen bg-set-bg text-white w-full overflow-hidden">
      
      {/* Sidebar solo para PC (oculto en móvil) */}
      <div className="hidden md:flex w-64 shrink-0 border-r border-gray-800">
        <Sidebar isAdmin={isAdmin} />
      </div>
      
      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col min-h-screen w-full min-w-0">
        <TopBar />
        
        {/* 
            👇 AÑADIDO pb-24 (padding-bottom) para que la BottomNav 
            no tape el final del contenido en móviles. 
        */}
        <main className="flex-1 w-full min-w-0 pb-24 md:pb-0 flex flex-col overflow-x-hidden">
          <div className="flex-1 w-full min-w-0">
            <SubscriptionGate isExpired={shouldBlock}>
              {children}
            </SubscriptionGate>
          </div>
          
          {/* Footer solo para PC */}
          <div className="hidden md:block">
            <Footer />
          </div>
        </main>
        
        {/* BottomNav solo para móvil (oculto en PC) */}
        <BottomNav isAdmin={isAdmin} />
        
        <InstallPwaBanner />
      </div>
    </div>
  );
}
