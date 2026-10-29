import type { MetadataRoute } from 'next'
import { CATEGORIES, TYPES_ANNONCE } from '@/data/annonces'
import { FORMALITES } from '@/data/formalites'
import { GUIDES } from '@/data/guides'
import { SITE } from '@/data/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/annonces-legales',
    '/annonces-legales/tarifs',
    '/formalites',
    '/formalites/tarifs',
    '/tunnel',
    '/professionnels',
    '/guides',
    '/qui-sommes-nous',
    '/contact',
    '/cgv',
    '/mentions-legales',
    '/confidentialite',
    ...CATEGORIES.map((c) => `/annonces-legales/${c.slug}`),
    ...TYPES_ANNONCE.map((t) => `/annonces-legales/${t.categorie}/${t.slug}`),
    ...FORMALITES.map((f) => `/formalites/${f.categorie}/${f.slug}`),
    ...GUIDES.map((g) => `/guides/${g.slug}`),
  ]
  return pages.map((p) => ({ url: `${SITE.url}${p}` }))
}
