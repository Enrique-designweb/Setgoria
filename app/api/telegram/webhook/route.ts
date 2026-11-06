// app/api/telegram/webhook/route.ts
import { NextResponse } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

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
      `¡Bienvenido a *SETGORIA Sport*, ${username}! ⚽🎾\n\nSoy tu asistente. ¿Qué quieres hacer hoy?`,
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([
          ["⚽ Partidos", "📊 Pronósticos"],
          ["👑 Premium", "💳 Pagos"],
          ["🔐 Login Web", "🆘 Soporte"]
        ]).resize(),
      }
    );
  } catch (error) {
    console.error("Error en /start:", error);
    return ctx.reply("Hubo un error al registrarte.");
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
    
    return ctx.replyWithMarkdown(mensaje);
  } catch (error) {
    console.error("Error al cargar partidos:", error);
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
    
    return ctx.replyWithMarkdown(mensaje);
  } catch (error) {
    console.error("Error al cargar pronósticos:", error);
    return ctx.reply("Error al cargar pronósticos.");
  }
});

// --- COMANDO /premium ---
bot.hears("👑 Premium", async (ctx) => {
  return ctx.reply(
    "👑 *SUSCRIPCIÓN PREMIUM*\n\nDesbloquea todos los pronósticos y estadísticas en vivo.",
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("💳 QvaPay (USD)", "https://setgoria.vercel.app/suscripcion?method=QVAPAY")],
        [Markup.button.url("🏦 Transfermóvil (CUP)", "https://setgoria.vercel.app/suscripcion?method=TRANSFERMOVIL")],
        [Markup.button.url("🌐 Ir a la Web", "https://setgoria.vercel.app/suscripcion")],
      ])
    }
  );
});

// --- COMANDO /pagos ---
bot.hears("💳 Pagos", async (ctx) => {
  return ctx.reply(
    "💳 *MÉTODOS DE PAGO*\n\n1️⃣ *QvaPay* (Automático)\n2️⃣ *Transfermóvil* (Manual)\n3️⃣ *USDT* (Cripto)\n\nElige tu método:",
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("Pagar con QvaPay", "https://setgoria.vercel.app/suscripcion?method=QVAPAY")],
        [Markup.button.url("Pagar con Transfermóvil", "https://setgoria.vercel.app/suscripcion?method=TRANSFERMOVIL")],
        [Markup.button.url("Pagar con USDT", "https://setgoria.vercel.app/suscripcion?method=USDT")],
      ])
    }
  );
});

// --- COMANDO /login (OTP para la Web) ---
bot.hears("🔐 Login Web", async (ctx) => {
  const chatId = ctx.chat.id.toString();
  
  try {
    const telUser = await prisma.telegramUser.findUnique({ where: { chatId } });
    
    if (!telUser || !telUser.userId) {
      return ctx.reply("⚠️ Primero debes vincular tu correo. Escribe tu correo electrónico a continuación:");
    }

    const user = await prisma.user.findUnique({ where: { id: telUser.userId } });
    if (!user || !user.email) return ctx.reply("Error: No se encontró tu usuario.");

    // Generamos OTP de 6 dígitos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: hashedOtp, twoFactorExpiresAt: expiresAt }
    });

    return ctx.reply(`🔐 *Tu código de acceso es:* \`${otpCode}\`\n\nEste código expira en 10 minutos. Úsalo en la web para iniciar sesión.`, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error generando OTP:", error);
    return ctx.reply("Error al generar el código de acceso.");
  }
});

// --- COMANDO /soporte ---
bot.hears("🆘 Soporte", async (ctx) => {
  return ctx.reply(
    "🆘 *SOPORTE TÉCNICO SETGORIA*\n\n¿Tienes problemas con tu cuenta o pagos?\n\n📧 Email: leonardofonseca302@gmail.com\n💬 WhatsApp: +53 51756491\n\nTe responderemos lo antes posible.",
    { parse_mode: "Markdown" }
  );
});

// --- MANEJO DE TEXTO (Vincular Correo) ---
bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const chatId = ctx.chat.id.toString();
  
  // Si el texto es un correo, buscamos al usuario y vinculamos
  if (text.includes("@") && text.includes(".")) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: text.toLowerCase().trim() },
      });

      if (!user) return ctx.reply("❌ No encontré ninguna cuenta con ese correo.");

      // Vinculamos el TelegramUser con el User
      await prisma.telegramUser.update({
        where: { chatId },
        data: { userId: user.id }
      });

      return ctx.reply(`✅ ¡Cuenta vinculada con éxito! Ahora eres *${user.name || 'Usuario'}*.\n\nYa puedes usar el botón de *🔐 Login Web* para obtener tu código de acceso.`, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Error vinculando correo:", error);
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
