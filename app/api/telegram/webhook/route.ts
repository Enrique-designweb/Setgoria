// app/api/telegram/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

async function sendMessage(chatId: number, text: string, options?: Record<string, unknown>) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...options }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.message || !body.message.text) {
      return NextResponse.json({ ok: true }); 
    }

    const chatId = body.message.chat.id;
    const text = body.message.text;
    const firstName = body.message.from.first_name || "Usuario";
    const username = body.message.from.username;

    if (text.startsWith("/start")) {
      await prisma.telegramUser.upsert({
        where: { chatId: chatId.toString() },
        update: { username },
        create: { chatId: chatId.toString(), username },
      });

      await sendMessage(
        chatId, 
        `¡Hola <b>${firstName}</b>! 👋\n\nBienvenido a <b>SETGORIA</b> ⚡.\n\nUsa los comandos del menú para interactuar conmigo:\n\n/partidos - Ver partidos en vivo\n/pronosticos - Pronósticos del día\n/premium - Información de suscripción\n/soporte - Hablar con un asesor\n/vincular - Enlazar tu cuenta de la web`
      );
      return NextResponse.json({ ok: true });
    }

    // 👇 NUEVO COMANDO: /vincular CODIGO
    if (text.startsWith("/vincular")) {
      const parts = text.split(" ");
      const linkCode = parts[1];

      if (!linkCode) {
        await sendMessage(chatId, "⚠️ Debes enviar un código. Ejemplo: <code>/vincular A1B2C3</code>");
        return NextResponse.json({ ok: true });
      }

      // Buscamos al usuario por los primeros 6 caracteres de su CUID
      const user = await prisma.user.findFirst({
        where: { id: { startsWith: linkCode.toUpperCase() } } // Asumiendo que guardamos el código en mayúsculas
      });

      if (!user) {
        await sendMessage(chatId, "❌ Código inválido o expirado. Copia tu código desde tu perfil en setgoria.com");
        return NextResponse.json({ ok: true });
      }

      // Vinculamos el chatId al userId
      await prisma.telegramUser.upsert({
        where: { chatId: chatId.toString() },
        update: { userId: user.id, username },
        create: { chatId: chatId.toString(), userId: user.id, username },
      });

      await sendMessage(chatId, `✅ ¡Cuenta vinculada con éxito, <b>${user.name}</b>!\n\nAhora recibirás tus códigos OTP de seguridad aquí y podrás gestionar tus pagos premium de forma más rápida.`);
      return NextResponse.json({ ok: true });
    }

    await sendMessage(chatId, "No entiendo ese comando 🤔. Por favor, usa el menú de comandos o escribe /start para volver al inicio.");
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Error en Telegram Webhook:", error);
    return NextResponse.json({ ok: true });
  }
}
