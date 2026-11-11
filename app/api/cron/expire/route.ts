// app/api/cron/expire/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // Seguridad: Vercel envía un header secreto para autorizar el cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Expirar suscripciones vencidas
    const expiredSubs = await prisma.subscription.updateMany({
      where: { 
        status: "ACTIVE", 
        expiresAt: { lt: now } 
      },
      data: { status: "EXPIRED" }
    });

    // 2. Eliminar historias caducadas (más de 24h)
    const deletedStories = await prisma.story.deleteMany({
      where: { 
        expiresAt: { lt: now } 
      }
    });

    return NextResponse.json({ 
      success: true, 
      expiredSubscriptions: expiredSubs.count,
      deletedStories: deletedStories.count 
    });
  } catch (error: unknown) {
    console.error("Error en Cron de expiración:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
