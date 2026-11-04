// types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      createdAt: Date
      isPremium?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    createdAt: Date
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    createdAt: Date
  }
}
