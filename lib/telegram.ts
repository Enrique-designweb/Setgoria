// lib/telegram.ts
import { prisma } from "@/lib/prisma";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export async function broadcastTelegramMessage(message: string) {
  try {
    // Buscamos todos los usuarios con Telegram vinculado
    const users = await prisma.telegramUser.findMany({
      where: { userId: { not: null } }
    });

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: user.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });
      
      if (res.ok) successCount++;
      else errorCount++;
    }

    return { success: true, successCount, errorCount };
  } catch (error) {
    console.error("Error en broadcast de Telegram:", error);
    return { success: false, error };
  }
}
