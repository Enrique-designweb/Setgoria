// app/api/telegram/webhook/route.ts
import { NextResponse } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { prisma } from "@/lib/prisma";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// --- COMANDO /start (PROFESIONAL) ---
bot.start(async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const username = ctx.from.username || ctx.from.first_name;

  try {
    await prisma.telegramUser.upsert({
      where: { chatId },
      update: { username },
      create: { chatId, username },
    });

    return ctx.reply(
      `¡Bienvenido a *SETGORIA Sport*, ${username}! ⚽🎾\n\n` +
      `Soy tu asistente inteligente. Selecciona una opción para comenzar:`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.callback('⚽ Partidos en Vivo', 'partidos_live')],
          [Markup.button.callback('📊 Pronósticos', 'pronosticos')],
          [Markup.button.callback('👑 Mi Suscripción', 'premium')],
          [Markup.button.callback('🔐 Vincular Cuenta / Login', 'login')],
          [Markup.button.callback('🆘 Soporte', 'soporte')],
        ])
      }
    );
  } catch (error) {
    console.error("Error en /start:", error);
    return ctx.reply("Hubo un error al registrarte.");
  }
});

// --- MANEJO DE BOTONES INLINE ---
bot.action('partidos_live', async (ctx) => {
  await ctx.answerCbQuery();
  const matches = await prisma.match.findMany({ where: { status: "LIVE" }, take: 5 });
  
  if (matches.length === 0) return ctx.reply("No hay partidos en vivo ahora mismo.");
  
  let msg = "🔴 *PARTIDOS EN VIVO* 🔴\n\n";
  matches.forEach(m => {
    msg += `🏆 ${m.league}\n${m.homeTeam} ${m.homeScore ?? 0} - ${m.awayScore ?? 0} ${m.awayTeam}\n\n`;
  });
  return ctx.replyWithMarkdown(msg);
});

bot.action('pronosticos', async (ctx) => {
  await ctx.answerCbQuery();
  const matches = await prisma.match.findMany({ where: { status: "NS" }, include: { predictions: true }, take: 3 });
  
  if (matches.length === 0) return ctx.reply("No hay pronósticos disponibles.");
  
  let msg = "📊 *PRONÓSTICOS DESTACADOS* 📊\n\n";
  matches.forEach(m => {
    msg += `⚽ *${m.homeTeam} vs ${m.awayTeam}*\n`;
    m.predictions.forEach(p => {
      msg += `- ${p.type} (${p.probability}%)${p.isPremium ? " 👑" : ""}\n`;
    });
    msg += "\n";
  });
  return ctx.replyWithMarkdown(msg);
});

bot.action('premium', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("👑 Para ver tu suscripción, visita la web:\nhttps://setgoria.vercel.app/suscripcion");
});

bot.action('login', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("🔐 Por favor, escribe tu correo electrónico para vincular tu cuenta de Telegram con la web:");
});

bot.action('soporte', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("🆘 Soporte Técnico:\n📧 hernanglez06@gmail.com\n💬 WhatsApp: +53 51756491");
});

// --- MANEJO DE TEXTO (Vincular Correo) ---
bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const chatId = ctx.chat.id.toString();
  
  if (text.includes("@") && text.includes(".")) {
    try {
      const user = await prisma.user.findUnique({ where: { email: text.toLowerCase().trim() } });
      if (!user) return ctx.reply("❌ No encontré ninguna cuenta con ese correo. Regístrate en la web primero.");

      await prisma.telegramUser.update({
        where: { chatId },
        data: { userId: user.id }
      });

      return ctx.reply(`✅ ¡Cuenta vinculada con éxito! Hola, *${user.name || 'Usuario'}*. Ya puedes recibir alertas.`, { parse_mode: "Markdown" });
    } catch (error) {
      console.error(error);
      return ctx.reply("Error al buscar tu cuenta. Intenta más tarde.");
    }
  }
});

// --- WEBHOOK HANDLER ---
export async function POST(req: Request) {
  try {
    const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
    if (process.env.TELEGRAM_WEBHOOK_SECRET && secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error procesando webhook de Telegram:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
