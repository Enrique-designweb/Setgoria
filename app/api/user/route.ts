// app/api/user/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateCubanCI } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, image: true, birthDate: true,
        phone: true, documentId: true, idCardUrl: true, kycStatus: true, role: true, referralCode: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("Error obteniendo usuario:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { name, birthDate, phone, documentId, idCardUrl } = await req.json();

    if (!birthDate) {
      return NextResponse.json({ message: "La fecha de nacimiento es obligatoria" }, { status: 400 });
    }

    // 👇 VALIDACIÓN INTELIGENTE: Si el CI tiene 11 dígitos, asumimos que es cubano
    if (documentId && documentId.replace(/\D/g, "").length === 11) {
      const validation = validateCubanCI(documentId, birthDate);
      if (!validation.isValid) {
        return NextResponse.json({ message: validation.message }, { status: 403 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        birthDate: new Date(birthDate),
        phone: phone || undefined,
        documentId: documentId || undefined,
        idCardUrl: idCardUrl || undefined,
        kycStatus: documentId ? "PENDING" : "NOT_SUBMITTED", 
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
