import type { Metadata } from 'next'
import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { EnTetePage } from '@/components/EnTetePage'
import { GUIDES } from '@/data/guides'

export const metadata: Metadata = {
  title: 'Guides des formalités et annonces légales',
  description: 'Créer, modifier, fermer une société : nos guides pratiques, à jour des règles et des tarifs en vigueur.',
  alternates: { canonical: '/guides' },
}

export default function Guides() {
  return (
    <>
      <EnTetePage
        ariane={[{ nom: 'Guides' }]}
        surtitre="Guides pratiques"
        titre={
          <>
            Le droit des sociétés, <em>sans jargon</em>.
          </>
        }
        chapo="Les règles, les délais et les coûts, expliqués simplement. Chaque guide cite ses textes et va droit à ce que vous devez faire."
      />
      <section className="section">
        <div className="conteneur grille grille-3">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="carte carte-lien">
              <strong>{g.titre}</strong>
              <span className="petit muted">{g.description}</span>
              <span className="prix">Lire le guide →</span>
            </Link>
          ))}
        </div>
      </section>
      <BandeauCta />
    </>
  )
}
