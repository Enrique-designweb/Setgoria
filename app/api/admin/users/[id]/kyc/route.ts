// app/api/admin/users/[id]/kyc/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json(); // 'APPROVE' o 'REJECT'

    const user = await prisma.user.update({
      where: { id },
      data: { 
        kycStatus: action === 'APPROVE' ? "APPROVED" : "REJECTED" 
      },
    });

    // Notificamos al usuario
    await prisma.notification.create({
      data: {
        userId: id,
        message: action === 'APPROVE' 
          ? "✅ Tu identidad ha sido verificada exitosamente. Ya tienes el sello de Verificado."
          : "❌ Tu verificación de identidad fue rechazada. Por favor, revisa los datos e inténtalo de nuevo.",
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    console.error("Error en KYC:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
