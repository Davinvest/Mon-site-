import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BandeauCta } from '@/components/BandeauCta'
import { EnTetePage } from '@/components/EnTetePage'
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
  const types = typesDeCategorie(c.slug)
  return (
    <>
      <EnTetePage
        large
        ariane={[{ nom: 'Annonces légales', href: '/annonces-legales' }, { nom: c.titre }]}
        surtitre={`Annonces légales · ${types.length} formulaire${types.length > 1 ? 's' : ''}`}
        titre={
          <>
            {c.titre} : <em>choisissez, remplissez, publiez</em>.
          </>
        }
        chapo={c.description}
      />
      <section className="section">
        <div className="conteneur grille grille-3">
          {types.map((t) => (
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
