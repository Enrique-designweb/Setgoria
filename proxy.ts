// proxy.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // 👈 Rutas que cualquiera puede ver SIN estar logueado
  const publicRoutes = [
    '/', 
    '/login', 
    '/forgot-password', 
    '/reset-password', 
    '/offline', 
    '/terminos', 
    '/estadisticas' // Si quieres que las estadísticas sean públicas, déjala aquí
  ]
  
  // Verificamos si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // 1. Si NO está logueado y trata de entrar a una ruta privada -> al Login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // 2. Si YA está logueado y trata de entrar a la Landing (/) o al Login -> a su Dashboard (/inicio)
  if (isLoggedIn && (pathname === '/' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/inicio', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  // Excluimos APIs, archivos estáticos, la PWA y el favicon del middleware
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)'],
}
