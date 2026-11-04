// app/api/upload/avatar/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Verificar sesión
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 2. Obtener el archivo del FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No se envió ningún archivo" }, { status: 400 });
    }

    // 3. Convertir el archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Subir a Cloudinary usando un Stream (más eficiente para Next.js)
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: "setgoria_avatars", // Carpeta donde se guardarán
          transformation: { width: 250, height: 250, crop: "fill", gravity: "face" } // Recorte automático al rostro
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const secureUrl = (uploadResult as { secure_url: string }).secure_url;

    // 5. Actualizar el usuario en la base de datos
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: secureUrl },
    });

    return NextResponse.json({ url: secureUrl });

  } catch (error) {
    console.error("Error subiendo avatar:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
