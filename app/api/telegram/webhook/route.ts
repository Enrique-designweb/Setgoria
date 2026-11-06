// app/api/telegram/webhook/route.ts
import { NextResponse } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { prisma } from "@/lib/prisma";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// --- COMANDO /start ---
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
      `¡Bienvenido a *SETGORIA Sport*, ${username}! ⚽🎾\n\nSoy tu asistente de pronósticos. ¿Qué quieres hacer hoy?`,
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([
          ["⚽ Partidos", "📊 Pronósticos"],
          ["👑 Premium", "💳 Pagos"],
          ["🆘 Soporte"]
        ]).resize(),
      }
    );
  } catch (error: unknown) {
    // 👈 CORREGIDO: Ahora usamos 'error' para loguearlo
    console.error("Error guardando usuario en /start:", error);
    return ctx.reply("Hubo un error al registrarte. Intenta de nuevo.");
  }
});

// --- COMANDO /partidos ---
bot.hears("⚽ Partidos", async (ctx) => {
  try {
    const partidos = await prisma.match.findMany({
      where: { status: { in: ["LIVE", "NS"] } },
      take: 5,
      orderBy: { matchDate: "asc" },
    });

    if (partidos.length === 0) return ctx.reply("No hay partidos disponibles por ahora.");

    let mensaje = "⚽ *PARTIDOS DE HOY* ⚽\n\n";
    partidos.forEach((p) => {
      const fecha = p.matchDate.toLocaleDateString("es-ES", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      const estado = p.status === "LIVE" ? `🔴 EN VIVO (${p.elapsed}')` : `🕒 ${fecha}`;
      
      mensaje += `🏆 *${p.league}*\n`;
      mensaje += `${p.homeTeam} ${p.homeScore ?? '-'} : ${p.awayScore ?? '-'} ${p.awayTeam}\n`;
      mensaje += `${estado}\n\n`;
    });
    
    mensaje += `_Usa /pronosticos para ver las predicciones._`;
    return ctx.replyWithMarkdown(mensaje);
  } catch (error: unknown) {
    // 👈 CORREGIDO: Ahora usamos 'error' para loguearlo
    console.error("Error al cargar partidos en el bot:", error);
    return ctx.reply("Error al cargar partidos.");
  }
});

// --- COMANDO /pronosticos ---
bot.hears("📊 Pronósticos", async (ctx) => {
  try {
    const partidos = await prisma.match.findMany({
      where: { status: { in: ["LIVE", "NS"] } },
      take: 5,
      orderBy: { matchDate: "asc" },
      include: { predictions: true },
    });

    if (partidos.length === 0) return ctx.reply("No hay pronósticos disponibles.");

    let mensaje = "📊 *PRONÓSTICOS DESTACADOS* 📊\n\n";
    partidos.forEach((p) => {
      mensaje += `⚽ *${p.homeTeam} vs ${p.awayTeam}*\n`;
      if (p.predictions.length > 0) {
        p.predictions.forEach((pred) => {
          const premiumTag = pred.isPremium ? " 👑 [PREMIUM]" : "";
          mensaje += `- ${pred.type} (${pred.probability}%)${premiumTag}\n`;
        });
      }
      mensaje += `\n`;
    });
    
    mensaje += `💡 _Los pronósticos 👑 son exclusivos para usuarios Premium._`;
    
    return ctx.replyWithMarkdown(mensaje, Markup.inlineKeyboard([
      [Markup.button.callback("👑 Hacerme Premium", "premium_info")]
    ]));
  } catch (error: unknown) {
    // 👈 CORREGIDO: Ahora usamos 'error' para loguearlo
    console.error("Error al cargar pronósticos en el bot:", error);
    return ctx.reply("Error al cargar pronósticos.");
  }
});

// --- COMANDO /premium ---
bot.hears("👑 Premium", async (ctx) => {
  return ctx.reply(
    "👑 *SUSCRIPCIÓN PREMIUM*\n\nDesbloquea todos los pronósticos y estadísticas en vivo.\n\nPara ver tu estado actual o renovar, usa los botones de abajo.",
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("💳 Ir a la Web (Renovar)", "https://setgoria.vercel.app/suscripcion")],
        [Markup.button.callback("📊 Consultar mi estado", "consultar_estado")]
      ])
    }
  );
});

// --- COMANDO /pagos ---
bot.hears("💳 Pagos", async (ctx) => {
  return ctx.reply(
    "💳 *MÉTODOS DE PAGO*\n\nAceptamos las siguientes opciones:\n\n1️⃣ *QvaPay* (Pago automático en USD)\n2️⃣ *Transfermóvil / Tarjeta* (Pago manual en CUP)\n3️⃣ *USDT (TRC-20)* (Criptomoneda)\n\nPara pagar, visita la web:",
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🌐 Ir a Pagar", "https://setgoria.vercel.app/suscripcion")]
      ])
    }
  );
});

// --- COMANDO /soporte ---
bot.hears("🆘 Soporte", async (ctx) => {
  return ctx.reply(
    "🆘 *SOPORTE SETGORIA*\n\n¿Tienes dudas o problemas con tu cuenta? Contáctanos:\n\n📧 Email: soporte@setgoria.com\n💬 WhatsApp: +53 5555 5555\n\nTe responderemos lo antes posible.",
    { parse_mode: "Markdown" }
  );
});

// --- MANEJO DE CORREOS (Para consultar suscripción) ---
bot.action("consultar_estado", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("Por favor, escribe el correo electrónico que usaste en SETGORIA:");
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  
  if (text.includes("@") && text.includes(".")) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: text.toLowerCase().trim() },
        include: { subscriptions: { where: { status: "ACTIVE", expiresAt: { gt: new Date() } } } }
      });

      if (!user) return ctx.reply("❌ No encontré ninguna cuenta con ese correo. Verifica e intenta de nuevo.");

      const activeSub = user.subscriptions[0];
      if (activeSub) {
        const fecha = activeSub.expiresAt.toLocaleDateString("es-ES", { dateStyle: "long" });
        return ctx.reply(`✅ *${user.name || 'Usuario'}*, tu suscripción *${activeSub.plan}* está activa hasta el *${fecha}*.`, { parse_mode: "Markdown" });
      } else {
        return ctx.reply(
          `⚠️ *${user.name || 'Usuario'}*, no tienes una suscripción activa.\n\n¡Hazte Premium ahora!`, 
          { 
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([[Markup.button.url("👑 Comprar Premium", "https://setgoria.vercel.app/suscripcion")]])
          }
        );
      }
    } catch (error: unknown) {
       console.error("Error consultando suscripción por email:", error);
       return ctx.reply("Error al consultar tu cuenta. Intenta más tarde.");
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
  } catch (error: unknown) {
    console.error("Error procesando webhook de Telegram:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
