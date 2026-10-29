import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BandeauCta } from '@/components/BandeauCta'
import { FilAriane } from '@/components/FilAriane'
import { CATEGORIES, trouverCategorie, typesDeCategorie } from '@/data/annonces'
import { prixAffiche } from '@/lib/prix'

export const dynamicParams = false

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ categorie: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ categorie: string }> }): Promise<Metadata> {
  const c = trouverCategorie((await params).categorie)
  if (!c) return {}
  return { title: `Annonce légale : ${c.titre.toLowerCase()}`, description: c.description, alternates: { canonical: `/annonces-legales/${c.slug}` } }
}

export default async function PageCategorie({ params }: { params: Promise<{ categorie: string }> }) {
  const c = trouverCategorie((await params).categorie)
  if (!c) notFound()
  return (
    <>
      <section className="heros" style={{ paddingBottom: 24 }}>
        <div className="conteneur">
          <FilAriane elements={[{ nom: 'Annonces légales', href: '/annonces-legales' }, { nom: c.titre }]} />
          <h1>{c.titre}</h1>
          <p className="chapo">{c.description}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 16 }}>
        <div className="conteneur grille grille-3">
          {typesDeCategorie(c.slug).map((t) => (
            <Link key={t.slug} href={`/annonces-legales/${c.slug}/${t.slug}`} className="carte carte-lien">
              <strong>{t.titre}</strong>
              <span className="petit muted">{t.resume}</span>
              <span className="prix">{prixAffiche(t)}</span>
            </Link>
          ))}
        </div>
      </section>
      <BandeauCta />
    </>
  )
}
