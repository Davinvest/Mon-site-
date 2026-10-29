import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BandeauCta } from '@/components/BandeauCta'
import { FilAriane } from '@/components/FilAriane'
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
  return (
    <>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="conteneur">
          <FilAriane elements={[{ nom: 'Guides', href: '/guides' }, { nom: g.titre }]} />
          <article className="prose">
            <h1>{g.titre}</h1>
            <p className="chapo">{g.description}</p>
            <p className="petit muted">
              Mis à jour le {new Date(g.publieLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
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
            <div className="encadre">
              <Link href={g.lienAction.href}>{g.lienAction.libelle} →</Link>
            </div>
          </article>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </section>
      <BandeauCta />
    </>
  )
}
