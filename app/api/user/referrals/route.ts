// app/api/user/referrals/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        referralCode: true,
        referrals: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      referralCode: user.referralCode || "",
      referrals: user.referrals || [],
    });

  } catch (error: unknown) {
    console.error("Error obteniendo referidos:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
