// app/api/admin/predictions/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ message: "No autorizado" }, { status: 403 });

    const { matchId, type, probability, isPremium } = await req.json();

    const prediction = await prisma.prediction.create({
      data: { matchId, type, probability, isPremium },
      include: { match: true }
    });

    // 👈 NOTIFICACIÓN TELEGRAM PARA PREMIUM
    if (isPremium) {
      const telegramUsers = await prisma.telegramUser.findMany();
      
      const mensaje = `🔥 *¡NUEVO PRONÓSTICO PREMIUM!*\n\n🏆 *${prediction.match.league}*\n⚽ ${prediction.match.homeTeam} vs ${prediction.match.awayTeam}\n📊 ${prediction.type} (${prediction.probability}%)\n\n👉 Entra a la web para ver los detalles.`;

      await Promise.allSettled(
        telegramUsers.map(u => 
          bot.telegram.sendMessage(u.chatId, mensaje, { parse_mode: "Markdown" })
             .catch(err => console.error(`Error a ${u.chatId}:`, err))
        )
      );
    }

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error creando pronóstico:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
