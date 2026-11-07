// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SETGORIA | Pronósticos Deportivos',
    short_name: 'Setgoria',
    description: 'Plataforma premium de pronósticos deportivos para fútbol y tenis.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090a0e',
    theme_color: '#f97316',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
