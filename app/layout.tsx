// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers"; // 👈 Usamos la ruta absoluta como te funcionó

export const metadata: Metadata = {
  title: "SETGORIA | Pronósticos Deportivos",
  description: "Plataforma de pronósticos deportivos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="bg-set-bg text-set-text font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
