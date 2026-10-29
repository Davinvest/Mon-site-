import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FilAriane } from '@/components/FilAriane'
import { FormulaireContact } from '@/components/FormulaireContact'
import { trouverType } from '@/data/annonces'
import { CATEGORIES_FORMALITES, ETAPES_FORMALITE, FORMALITES, prixAccompagnement, trouverFormalite } from '@/data/formalites'
import { FORFAITS } from '@/data/tarifs-annonces'
import { euros } from '@/lib/prix'

export const dynamicParams = false

export function generateStaticParams() {
  return FORMALITES.map((f) => ({ categorie: f.categorie, slug: f.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ categorie: string; slug: string }> }): Promise<Metadata> {
  const { categorie, slug } = await params
  const f = trouverFormalite(categorie, slug)
  if (!f) return {}
  return {
    title: `${f.titre} : démarches, pièces et prix`,
    description: `${f.resume} Annonce légale au tarif officiel, dossier déposé au guichet unique par un formaliste.`,
    alternates: { canonical: `/formalites/${f.categorie}/${f.slug}` },
  }
}

export default async function FicheFormalite({ params }: { params: Promise<{ categorie: string; slug: string }> }) {
  const { categorie, slug } = await params
  const f = trouverFormalite(categorie, slug)
  if (!f) notFound()
  const cat = CATEGORIES_FORMALITES.find((c) => c.slug === f.categorie)
  const annonce = f.annonce ? trouverType(f.annonce) : undefined
  const forfaitAnnonce = annonce?.forfait ? FORFAITS[annonce.forfait].france : null

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="conteneur">
        <FilAriane elements={[{ nom: 'Formalités', href: '/formalites' }, { nom: cat?.titre ?? '', href: `/formalites#${f.categorie}` }, { nom: f.titre }]} />
        <div className="mise-en-page-fiche">
          <article className="prose">
            <span className="surtitre">{cat?.titre}</span>
            <h1>{f.titre}</h1>
            <p className="chapo">{f.resume}</p>

            <h2>Ce que nous faisons pour vous</h2>
            <ol>
              {ETAPES_FORMALITE.filter((e) => annonce || !e.titre.includes('annonce')).map((e) => (
                <li key={e.titre}>
                  <strong>{e.titre}.</strong> {e.texte}
                </li>
              ))}
            </ol>

            <h2>Les pièces à fournir</h2>
            <ul>
              {f.pieces.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>

            <h2>Le prix</h2>
            <div className="table-scroll">
              <table>
                <tbody>
                  <tr>
                    <td>Accompagnement Comptoir Légal</td>
                    <td className="montant">{prixAccompagnement(f)}</td>
                  </tr>
                  {annonce && (
                    <tr>
                      <td>
                        Annonce légale (<Link href={`/annonces-legales/${annonce.categorie}/${annonce.slug}`}>{annonce.titre}</Link>)
                      </td>
                      <td className="montant">{forfaitAnnonce ? `${euros(forfaitAnnonce)} HT` : 'au caractère'}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Frais officiels (greffe, INPI)</td>
                    <td className="montant">au tarif réglementé</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="muted petit" style={{ marginTop: 10 }}>
              {f.delai}. Le devis détaillé vous est envoyé avant tout engagement.
            </p>

            {annonce && (
              <div className="encadre">
                Vous voulez seulement publier l’annonce ? <Link href={`/tunnel?type=${annonce.slug}`}>Publiez-la en ligne en quelques minutes</Link>.
              </div>
            )}
          </article>

          <aside className="colle">
            <div className="carte carte-ombre">
              <p className="surtitre">Gratuit · sans engagement</p>
              <h2 style={{ fontSize: '1.3rem' }}>Être rappelé par un formaliste</h2>
              <p className="petit muted">Nous cadrons votre dossier et vous envoyons un devis sous 24 h ouvrées.</p>
              <FormulaireContact rappel sujet="Rappel formalité" origine={`/formalites/${f.categorie}/${f.slug}`} libelleBouton="Être rappelé" />
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
