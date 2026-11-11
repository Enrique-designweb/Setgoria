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
        subscriptions: {
          where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
          orderBy: { expiresAt: "desc" },
          take: 1,
          select: { plan: true }
        }
      },
    });

    if (!user) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });

    const activePlan = user.subscriptions.length > 0 ? user.subscriptions[0].plan : null;
    
    // 👇 Construimos el objeto manualmente para evitar el error de variables no usadas
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      birthDate: user.birthDate,
      phone: user.phone,
      documentId: user.documentId,
      idCardUrl: user.idCardUrl,
      kycStatus: user.kycStatus,
      role: user.role,
      referralCode: user.referralCode,
      activePlan
    };

    return NextResponse.json(userData);
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
  } catch (error: unknown) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
