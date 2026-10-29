import type { Metadata } from 'next'
import Link from 'next/link'
import { FilAriane } from '@/components/FilAriane'
import { GUIDES } from '@/data/guides'

export const metadata: Metadata = {
  title: 'Guides des formalités et annonces légales',
  description: 'Créer, modifier, fermer une société : nos guides pratiques, à jour des règles et tarifs en vigueur.',
  alternates: { canonical: '/guides' },
}

export default function Guides() {
  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="conteneur">
        <FilAriane elements={[{ nom: 'Guides' }]} />
        <h1>Guides pratiques</h1>
        <p className="chapo">Les règles, les délais et les coûts, expliqués simplement.</p>
        <div className="grille grille-3" style={{ marginTop: 28 }}>
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="carte carte-lien">
              <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem' }}>{g.titre}</strong>
              <span className="petit muted">{g.description}</span>
              <span className="prix">Lire le guide →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
