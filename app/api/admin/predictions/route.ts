// app/api/admin/predictions/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import webpush from "@/lib/webpush";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ message: "No autorizado" }, { status: 403 });

    const { matchId, type, probability, isPremium } = await req.json();

    const prediction = await prisma.prediction.create({
      data: { matchId, type, probability, isPremium },
      include: { match: true }
    });

    if (isPremium) {
      const subscriptions = await prisma.pushSubscription.findMany();
      
      const payload = JSON.stringify({
        title: "🔥 ¡Nuevo Pronóstico Premium!",
        body: `${prediction.match.homeTeam} vs ${prediction.match.awayTeam}: ${type}`,
        url: "/pronosticos"
      });

      await Promise.allSettled(
        subscriptions.map(sub => 
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          ).catch((err: { statusCode?: number }) => { // 👈 Tipado correcto aquí
            if (err.statusCode === 404 || err.statusCode === 410) {
              return prisma.pushSubscription.delete({ where: { id: sub.id } });
            }
            console.error("Error enviando push:", err);
          })
        )
      );
    }

    return NextResponse.json(prediction);
  } catch (error) { // 👈 Usamos el error
    console.error("Error creando pronóstico:", error);
    return NextResponse.json({ message: "Error al crear el pronóstico" }, { status: 500 });
  }
}
