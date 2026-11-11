// app/api/telegram/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Envía un mensaje de texto
async function sendMessage(chatId: number, text: string, options?: Record<string, unknown>) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...options }),
  });
}

// Responde a los clics de los botones (Para quitar el relojito de carga)
async function answerCallbackQuery(callbackQueryId: string, text: string) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: false }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 👇 1. MANEJAR CLICS EN BOTONES INLINE
    if (body.callback_query) {
      const callbackQueryId = body.callback_query.id;
      const data = body.callback_query.data;
      const chatId = body.callback_query.message.chat.id;

      if (data === "menu_partidos") {
        await answerCallbackQuery(callbackQueryId, "Buscando partidos...");
        await sendMessage(chatId, "⚽ Ve a la sección de partidos en vivo aquí: https://setgoria.com/futbol");
      } 
      else if (data === "menu_premium") {
        await answerCallbackQuery(callbackQueryId, "Cargando planes...");
        await sendMessage(chatId, "💎 Hazte Premium para acceder a todos los pronósticos: https://setgoria.com/suscripcion");
      }
      else if (data === "menu_soporte") {
        await answerCallbackQuery(callbackQueryId, "Abriendo soporte...");
        await sendMessage(chatId, "📞 Escríbenos a nuestro WhatsApp: https://wa.me/5351756491");
      }
      
      return NextResponse.json({ ok: true });
    }

    // 👇 2. MANEJAR MENSAJES DE TEXTO
    if (!body.message || !body.message.text) {
      return NextResponse.json({ ok: true }); 
    }

    const chatId = body.message.chat.id;
    const text = body.message.text;
    const firstName = body.message.from.first_name || "Usuario";
    const username = body.message.from.username;

    // Comando /start
    if (text.startsWith("/start")) {
      await prisma.telegramUser.upsert({
        where: { chatId: chatId.toString() },
        update: { username },
        create: { chatId: chatId.toString(), username },
      });

      // 👇 AQUÍ CREAMOS LOS BOTONES INTERACTIVOS
      await sendMessage(
        chatId, 
        `¡Hola <b>${firstName}</b>! 👋\n\nBienvenido a <b>SETGORIA</b> ⚡.\n\nUsa los botones de abajo para navegar rápido por la plataforma:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "⚽ Partidos en Vivo", callback_data: "menu_partidos" }],
              [{ text: "💎 Hacerme Premium", callback_data: "menu_premium" }],
              [{ text: "📞 Contactar Soporte", callback_data: "menu_soporte" }],
              [{ text: "🌐 Ir a la Web", url: "https://setgoria.com" }]
            ]
          }
        }
      );
      return NextResponse.json({ ok: true });
    }

    // Comando /vincular CODIGO
    if (text.startsWith("/vincular")) {
      const parts = text.split(" ");
      const linkCode = parts[1];

      if (!linkCode) {
        await sendMessage(chatId, "⚠️ Debes enviar un código. Ejemplo: <code>/vincular A1B2C3</code>");
        return NextResponse.json({ ok: true });
      }

      const user = await prisma.user.findFirst({
        where: { id: { startsWith: linkCode.toUpperCase() } }
      });

      if (!user) {
        await sendMessage(chatId, "❌ Código inválido o expirado. Copia tu código desde tu perfil en setgoria.com");
        return NextResponse.json({ ok: true });
      }

      await prisma.telegramUser.upsert({
        where: { chatId: chatId.toString() },
        update: { userId: user.id, username },
        create: { chatId: chatId.toString(), userId: user.id, username },
      });

      await sendMessage(chatId, `✅ ¡Cuenta vinculada con éxito, <b>${user.name}</b>!\n\nAhora recibirás tus códigos OTP de seguridad aquí.`);
      return NextResponse.json({ ok: true });
    }

    // Fallback
    await sendMessage(chatId, "No entiendo ese comando 🤔. Escribe /start para ver el menú principal.");
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Error en Telegram Webhook:", error);
    return NextResponse.json({ ok: true });
  }
}
