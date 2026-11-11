// proxy.ts (o middleware.ts en algunas versiones de Next)
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const isAdmin = req.auth?.user?.role === "ADMIN"

  // 👈 Rutas públicas
  const publicRoutes = [
    '/', 
    '/login', 
    '/forgot-password', 
    '/reset-password', 
    '/offline', 
    '/terminos', 
    '/estadisticas' 
  ]
  
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

  // 3. 👇 PROTECCIÓN DEL ADMIN: Si intenta ir a /admin y no es admin -> /inicio
  if (isLoggedIn && pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/inicio', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)'],
}
