// app/api/comments/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Escribe algo").max(200, "Máximo 200 caracteres"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const validation = commentSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });

  await prisma.comment.create({
    data: { userId: session.user.id, content: validation.data.content },
  });

  return NextResponse.json({ message: "Comentario publicado" });
}

export async function GET() {
  const comments = await prisma.comment.findMany({
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(comments);
}
