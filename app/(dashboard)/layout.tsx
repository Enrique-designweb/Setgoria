// app/(dashboard)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import SubscriptionGate from "@/components/ui/SubscriptionGate";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
  });

  const hasActiveSubscription = !!activeSub;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { createdAt: true, role: true },
  });

  const isAdmin = user?.role === "ADMIN";
  
  const now = new Date().getTime(); 
  const trialExpiresAt = user ? new Date(user.createdAt).getTime() + 72 * 60 * 60 * 1000 : 0;
  const isTrialExpired = now > trialExpiresAt;

  const shouldBlock = !isAdmin && isTrialExpired && !hasActiveSubscription;

  return (
    <div className="flex min-h-screen bg-set-bg text-white">
      {/* Sidebar oculto en móvil, visible en pantallas medianas o grandes */}
      <div className="hidden md:flex w-64 border-r border-gray-800">
        <Sidebar isAdmin={isAdmin} />
      </div>
      
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 overflow-x-hidden pb-20 md:pb-0 flex flex-col">
          <div className="flex-1">
            <SubscriptionGate isExpired={shouldBlock}>
              {children}
            </SubscriptionGate>
          </div>
          <div className="hidden md:block">
            <Footer />
          </div>
        </main>
        <BottomNav isAdmin={isAdmin} />
      </div>
    </div>
  );
}
