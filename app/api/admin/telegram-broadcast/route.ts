import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { broadcastTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const { message } = await req.json();
  const result = await broadcastTelegramMessage(message);
  return NextResponse.json(result);
}
