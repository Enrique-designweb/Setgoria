// lib/error-handler.ts
import { NextResponse } from "next/server";

export function handleApiError(error: unknown, defaultMessage = "Error interno del servidor") {
  console.error("API Error:", error);
  
  // Si es un error controlado de Next.js (como un redirect)
  if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
    throw error; 
  }

  // Extraer el mensaje si es un Error de JS estándar
  const message = error instanceof Error ? error.message : defaultMessage;
  
  return NextResponse.json(
    { message, success: false }, 
    { status: 500 }
  );
}
