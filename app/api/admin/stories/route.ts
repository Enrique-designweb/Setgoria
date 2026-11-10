// app/api/admin/stories/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
// 👇 IMPORTACIÓN CORREGIDA: Usamos v2 y los tipos oficiales de Cloudinary
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string; // "image" o "video"

    if (!file || !title) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 1. Convertir File a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Subir a Cloudinary usando un stream (Tipado correctamente)
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: type === "video" ? "video" : "image", folder: "setgoria_stories" },
        // 👇 TIPADO EXPLÍCITO PARA EVITAR EL "ANY"
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(error || new Error("Error desconocido en Cloudinary"));
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    // 3. Guardar en Base de Datos (Expira en 24 horas)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: {
        title,
        description,
        imageUrl: type === "image" ? uploadResult.secure_url : "https://res.cloudinary.com/tu-cloud/image/upload/v1/placeholder-video.jpg", // Placeholder si es video
        videoUrl: type === "video" ? uploadResult.secure_url : null,
        expiresAt,
        authorId: session.user.id as string,
      },
    });

    return NextResponse.json({ success: true, story });

  } catch (error: unknown) {
    console.error("Error subiendo historia:", error);
    return NextResponse.json({ message: "Error al subir la historia" }, { status: 500 });
  }
}
