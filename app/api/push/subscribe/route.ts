// app/api/push/subscribe/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { endpoint, keys } = await req.json();

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { userId: session.user.id },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error guardando suscripción push:", error); // 👈 Usamos 'error' aquí
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
