// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  // 👈 AÑADIMOS ESTA LÍNEA
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://setgoria.vercel.app"),
  
  title: {
    default: "SETGORIA | Pronósticos Deportivos",
    template: "%s | SETGORIA",
  },
  description:
    "Plataforma premium de pronósticos deportivos para fútbol y tenis. Predicciones con probabilidad, comunidad y estadísticas en vivo.",
  applicationName: "SETGORIA",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SETGORIA",
  },
  openGraph: {
    title: "SETGORIA | Pronósticos Deportivos",
    description: "Pronósticos con probabilidad para fútbol y tenis.",
    url: "https://setgoria.vercel.app",
    siteName: "SETGORIA",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SETGORIA | Pronósticos Deportivos",
    description: "Pronósticos con probabilidad para fútbol y tenis.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="bg-set-bg text-set-text font-sans antialiased">
        <Providers>
          {children}
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}
