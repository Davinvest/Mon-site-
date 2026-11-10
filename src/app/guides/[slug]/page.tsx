import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BandeauCta } from '@/components/BandeauCta'
import { EnTetePage } from '@/components/EnTetePage'
import { GUIDES, trouverGuide } from '@/data/guides'
import { SITE } from '@/data/site'

export const dynamicParams = false

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = trouverGuide((await params).slug)
  if (!g) return {}
  return { title: g.titre, description: g.description, alternates: { canonical: `/guides/${g.slug}` }, openGraph: { type: 'article' } }
}

export default async function PageGuide({ params }: { params: Promise<{ slug: string }> }) {
  const g = trouverGuide((await params).slug)
  if (!g) notFound()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: g.titre,
    description: g.description,
    datePublished: g.publieLe,
    publisher: { '@type': 'Organization', name: SITE.nom, url: SITE.url },
  }
  const majLe = new Date(g.publieLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <>
      <EnTetePage
        large
        ariane={[{ nom: 'Guides', href: '/guides' }, { nom: g.titre }]}
        surtitre={`Guide · mis à jour le ${majLe}`}
        titre={g.titre}
        chapo={g.description}
      />
      <section className="section">
        <div className="conteneur mise-en-page-fiche">
          <article className="prose">
            {g.sections.map((s) => (
              <section key={s.titre}>
                <h2>{s.titre}</h2>
                {s.paragraphes?.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
                {s.liste && (
                  <ul>
                    {s.liste.map((l) => (
                      <li key={l.slice(0, 40)}>{l}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
          <aside className="colle">
            <div className="carte carte-ombre">
              <p className="surtitre">Passez à l’action</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 600 }}>{g.lienAction.libelle}</p>
              <Link href={g.lienAction.href} className="btn btn-primaire btn-bloc">
                Commencer
              </Link>
            </div>
          </aside>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </section>
      <BandeauCta />
    </>
  )
}
