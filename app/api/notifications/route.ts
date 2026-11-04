// app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET: Obtener las últimas notificaciones
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10, // Solo las 10 más recientes
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

// PUT: Marcar todas como leídas
export async function PUT() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ message: "Notificaciones marcadas como leídas" });
}
