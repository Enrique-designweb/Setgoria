// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="theme-confort" 
        themes={['theme-confort', 'theme-oled']} 
        enableSystem={false}
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
