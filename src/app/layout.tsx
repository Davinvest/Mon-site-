import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Entete } from '@/components/Entete'
import { PiedDePage } from '@/components/PiedDePage'
import { MAQUETTE, SITE } from '@/data/site'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/source-serif-4/wght.css'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.nom} — ${SITE.slogan.replace(/\.$/, '')}`, template: `%s | ${SITE.nom}` },
  description: SITE.description,
  openGraph: { siteName: SITE.nom, locale: 'fr_FR', type: 'website' },
  alternates: { canonical: '/' },
  // La maquette ne doit pas être référencée : elle ferait doublon avec le site définitif.
  robots: MAQUETTE ? { index: false, follow: false } : undefined,
}

export const viewport: Viewport = {
  themeColor: '#fbf8f1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a href="#contenu" className="sr-only">
          Aller au contenu
        </a>
        {MAQUETTE && (
          <p className="bandeau-maquette" style={{ margin: 0 }}>
            Maquette de démonstration : aucune commande réelle n’est traitée. <Link href="/charte">Voir la charte</Link>
          </p>
        )}
        <Entete />
        <main id="contenu">{children}</main>
        <PiedDePage />
      </body>
    </html>
  )
}
