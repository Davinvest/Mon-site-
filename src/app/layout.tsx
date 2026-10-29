import type { Metadata, Viewport } from 'next'
import { Entete } from '@/components/Entete'
import { PiedDePage } from '@/components/PiedDePage'
import { SITE } from '@/data/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.nom} — Annonces légales et formalités au tarif réglementé`, template: `%s | ${SITE.nom}` },
  description: SITE.description,
  openGraph: { siteName: SITE.nom, locale: 'fr_FR', type: 'website' },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1513' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a href="#contenu" className="sr-only">
          Aller au contenu
        </a>
        <Entete />
        <main id="contenu">{children}</main>
        <PiedDePage />
      </body>
    </html>
  )
}
