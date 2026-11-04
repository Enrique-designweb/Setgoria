// auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Faltan datos")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) throw new Error("Credenciales incorrectas")

        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) throw new Error("Credenciales incorrectas")

        // Si ya verificó el OTP antes, entra directo
        if (user.hasVerifiedOtp) {
          return user;
        }

        // Si es la primera vez, validar OTP
        if (!credentials.otp) throw new Error("OTP requerido");
        
        if (!user.twoFactorCode || !user.twoFactorExpiresAt || user.twoFactorExpiresAt < new Date()) {
          throw new Error("El código ha expirado. Vuelve a intentarlo.");
        }

        const hashedOtp = crypto.createHash('sha256').update(credentials.otp as string).digest('hex');
        
        if (hashedOtp !== user.twoFactorCode) {
          throw new Error("Código de verificación incorrecto");
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { 
            hasVerifiedOtp: true,
            twoFactorCode: null, 
            twoFactorExpiresAt: null 
          }
        });

        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.createdAt = user.createdAt
      }
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } })
          if (!dbUser) return null
        } catch (error) { 
          console.error("Error de conexión a BD en JWT:", error) 
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.createdAt = token.createdAt as Date
        
        // Verificamos si tiene suscripción activa
        try {
          const sub = await prisma.subscription.findFirst({
            where: { 
              userId: session.user.id, 
              status: "ACTIVE", 
              expiresAt: { gt: new Date() } 
            }
          });
          session.user.isPremium = !!sub;
        } catch { // 👈 Corregido: Sin variable, evita el error de ESLint
          session.user.isPremium = false;
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
})
