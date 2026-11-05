// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner"; // 👈 Importar

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster 
        theme="dark" 
        position="top-center" 
        richColors 
        toastOptions={{
          style: { background: '#14161d', border: '1px solid #1f2937', color: 'white' }
        }}
      />
    </SessionProvider>
  );
}
