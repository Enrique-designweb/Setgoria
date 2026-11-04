// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Dominios permitidos para desarrollo (para que funcione en tu red local)
  allowedDevOrigins: ['192.168.0.105'],

  // 2. Optimización de imágenes externas
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Fotos de Google
      { protocol: 'https', hostname: 'res.cloudinary.com' },        // Fotos de Cloudinary
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },       // 👈 Imágenes de prueba para las Stories
    ],
  },

  // 3. Cabeceras de Seguridad HTTP
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" }, // Evita Clickjacking
          { key: "X-Content-Type-Options", value: "nosniff" }, // Evita MIME-sniffing
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }, // HSTS
        ],
      },
    ];
  },
};

export default nextConfig;
