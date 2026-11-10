import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BandeauCta } from '@/components/BandeauCta'
import { EnTetePage } from '@/components/EnTetePage'
import { trouverType } from '@/data/annonces'
import { CATEGORIES_FORMALITES, ETAPES_FORMALITE, FORMALITES, JETONS_PAR_ANNONCE, prixBrouillon, trouverFormalite } from '@/data/formalites'
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
    title: `${f.titre} : pièces, prix et brouillon INPI`,
    description: `${f.resume} Annonce légale au tarif officiel, puis brouillon pré-rempli sur votre compte du guichet unique.`,
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
    <>
      <EnTetePage
        large
        ariane={[{ nom: 'Guichet unique', href: '/formalites' }, { nom: cat?.titre ?? '', href: `/formalites#${f.categorie}` }, { nom: f.titre }]}
        surtitre={`Guichet unique · ${cat?.titre ?? ''}`}
        titre={
          <>
            {f.titre} : <em>votre dossier, déjà pré-rempli</em>.
          </>
        }
        chapo={f.resume}
      />

      <section className="section">
        <div className="conteneur mise-en-page-fiche">
          <article className="prose">
            <h2>Comment ça se passe</h2>
            <ol>
              {annonce && (
                <li>
                  <strong>Vous publiez l’annonce légale.</strong> Elle précède le dépôt : l’attestation de parution fait partie des
                  pièces du dossier.
                </li>
              )}
              {ETAPES_FORMALITE.map((e) => (
                <li key={e.titre}>
                  <strong>{e.titre}.</strong> {e.texte}
                </li>
              ))}
            </ol>

            <h2>Les pièces à déposer</h2>
            <ul>
              {f.pieces.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="muted petit">Liste indicative : le guichet unique peut demander d’autres justificatifs selon votre situation.</p>

            <h2>Le prix</h2>
            <div className="table-scroll">
              <table>
                <tbody>
                  {annonce && (
                    <tr>
                      <td>
                        Annonce légale (<Link href={`/annonces-legales/${annonce.categorie}/${annonce.slug}`}>{annonce.titre}</Link>)
                      </td>
                      <td className="montant montant-fort">{forfaitAnnonce ? `${euros(forfaitAnnonce)} HT` : 'au caractère'}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Brouillon pré-rempli sur votre compte INPI</td>
                    <td className="montant montant-fort">{prixBrouillon(f)}</td>
                  </tr>
                  <tr>
                    <td>Frais officiels de la formalité</td>
                    <td className="montant">réglés à l’INPI</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="muted petit" style={{ marginTop: 10 }}>
              Chaque annonce publiée crédite {JETONS_PAR_ANNONCE} jetons au portefeuille de votre cabinet.
            </p>
          </article>

          <aside className="colle">
            <div className="carte carte-ombre">
              <p className="surtitre">Brouillon INPI</p>
              <div className="prix-grand">{prixBrouillon(f)}</div>
              <p className="muted petit">Débités du portefeuille, rendus si le brouillon n’est pas créé.</p>
              <Link href="/connexion" className="btn btn-primaire btn-bloc">
                Commencer cette formalité
              </Link>
              <ul className="puces-confiance" style={{ flexDirection: 'column', gap: 6 }}>
                <li>Pré-rempli à partir de vos pièces</li>
                <li>Vous relisez et signez à l’INPI</li>
                <li>Pièces supprimées après 30 jours</li>
              </ul>
            </div>
            {annonce && (
              <div className="carte" style={{ marginTop: 16 }}>
                <strong>D’abord, l’annonce légale</strong>
                <p className="petit muted" style={{ margin: '6px 0 12px' }}>
                  {annonce.titre}
                  {forfaitAnnonce ? ` · ${euros(forfaitAnnonce)} HT` : ''}. Elle se publie sans compte.
                </p>
                <Link href={`/tunnel?type=${annonce.slug}`} className="btn btn-secondaire btn-bloc">
                  Publier l’annonce
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      <BandeauCta />
    </>
  )
}
