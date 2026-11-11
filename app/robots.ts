// app/robots.ts
import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://setgoria.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/perfil/'], // No indexar zonas privadas
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
