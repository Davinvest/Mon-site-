import type { MetadataRoute } from 'next'
import { MAQUETTE, SITE } from '@/data/site'

export default function robots(): MetadataRoute.Robots {
  if (MAQUETTE) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/commande/', '/connexion', '/charte'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
