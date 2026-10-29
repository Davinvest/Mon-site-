import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BandeauCta } from '@/components/BandeauCta'
import { Faq } from '@/components/Faq'
import { FilAriane } from '@/components/FilAriane'
import { TYPES_ANNONCE, trouverCategorie, trouverType } from '@/data/annonces'
import { saisieExemple } from '@/data/exemples'
import { FORMALITES } from '@/data/formalites'
import { MODELES } from '@/data/modeles'
import { ANNEE_TARIFS, FORFAITS, TARIF_CARACTERE } from '@/data/tarifs-annonces'
import { calculerPrix, euros, normaliserTexte } from '@/lib/prix'

export const dynamicParams = false

export function generateStaticParams() {
  return TYPES_ANNONCE.map((t) => ({ categorie: t.categorie, type: t.slug }))
}

async function charger(params: Promise<{ categorie: string; type: string }>) {
  const { categorie, type } = await params
  const t = trouverType(type)
  const c = trouverCategorie(categorie)
  if (!t || !c || t.categorie !== c.slug) return null
  return { t, c }
}

export async function generateMetadata({ params }: { params: Promise<{ categorie: string; type: string }> }): Promise<Metadata> {
  const r = await charger(params)
  if (!r) return {}
  const prix = r.t.forfait ? ` (${FORFAITS[r.t.forfait].france} € HT)` : ''
  return {
    title: `Annonce légale ${r.t.titre}${prix} : modèle et tarif ${ANNEE_TARIFS}`,
    description: `${r.t.resume} Modèle d’annonce, mentions obligatoires et prix réglementé ${ANNEE_TARIFS}.`,
    alternates: { canonical: `/annonces-legales/${r.c.slug}/${r.t.slug}` },
  }
}

export default async function FicheAnnonce({ params }: { params: Promise<{ categorie: string; type: string }> }) {
  const r = await charger(params)
  if (!r) notFound()
  const { t, c } = r
  const modele = MODELES[t.modele]
  const exemple = normaliserTexte(modele.rediger(saisieExemple(t.forme), { forme: t.forme, variante: t.variante }))
  const prixExemple = calculerPrix(t, '69', exemple)
  const forfait = t.forfait ? FORFAITS[t.forfait] : null
  const formalite = FORMALITES.find((f) => f.annonce === t.slug)
  const voisins = TYPES_ANNONCE.filter((x) => x.categorie === c.slug && x.slug !== t.slug).slice(0, 6)

  return (
    <>
      <section className="heros" style={{ paddingBottom: 24 }}>
        <div className="conteneur">
          <FilAriane
            elements={[
              { nom: 'Annonces légales', href: '/annonces-legales' },
              { nom: c.titre, href: `/annonces-legales/${c.slug}` },
              { nom: t.titre },
            ]}
          />
          <span className="surtitre">{c.titre}</span>
          <h1>Annonce légale : {t.titre}</h1>
          <p className="chapo">{t.resume}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }}>
        <div className="conteneur mise-en-page-fiche">
          <article className="prose">
            <h2>Combien coûte cette annonce en {ANNEE_TARIFS} ?</h2>
            {forfait ? (
              <p>
                C’est un <strong>forfait réglementé</strong> : {euros(forfait.france)} HT, soit {euros(Math.round(forfait.france * 120) / 100)} TTC,
                quel que soit le journal habilité et la longueur du texte. À La Réunion et à Mayotte, le forfait est de {euros(forfait.reunionMayotte)} HT.
              </p>
            ) : (
              <p>
                Cette annonce est <strong>facturée au caractère</strong>, espaces comprises, selon le département de publication : de{' '}
                {Math.min(...Object.values(TARIF_CARACTERE)).toLocaleString('fr-FR')} € à{' '}
                {Math.max(...Object.values(TARIF_CARACTERE)).toLocaleString('fr-FR')} € HT par caractère. L’exemple ci-dessous, publié dans
                le Rhône, compte {prixExemple.caracteres} caractères, soit {euros(prixExemple.ht)} HT.
              </p>
            )}
            <p>
              Rédaction, relecture par un formaliste et attestation de parution sont incluses. <Link href="/annonces-legales/tarifs">Voir la grille complète</Link>.
            </p>

            <h2>Les mentions obligatoires</h2>
            <ul>
              {modele.mentions.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>

            <h2>Exemple d’annonce</h2>
            <p className="muted petit">Exemple fictif, généré par notre formulaire. Votre annonce reprendra les informations de vos actes.</p>
            <div className="apercu">{exemple}</div>

            <h2>Comment la publier</h2>
            <ol>
              <li>Cliquez sur « Publier cette annonce » : le formulaire adapté s’ouvre.</li>
              <li>Complétez-le à partir de vos actes : le texte se rédige en direct.</li>
              <li>Vérifiez l’aperçu et le prix, puis payez en ligne.</li>
              <li>Un formaliste relit, nous transmettons au journal habilité, vous recevez l’attestation par e-mail.</li>
            </ol>

            <h2>Questions fréquentes</h2>
            <Faq
              questions={[
                {
                  q: 'Dans quel département publier ?',
                  r:
                    t.modele === 'cession-fonds' || t.modele === 'location-gerance' || t.modele === 'droit-au-bail'
                      ? 'Dans le département où se situe le fonds ou les locaux.'
                      : t.categorie === 'personnes-physiques'
                        ? 'Dans le département de votre domicile.'
                        : t.variante === 'nouveau-siege'
                          ? 'Dans le département du nouveau siège social.'
                          : 'Dans le département du siège social de la société.',
                },
                {
                  q: 'Puis-je modifier le texte proposé ?',
                  r: 'Oui. L’aperçu est modifiable avant le paiement. Pour une annonce au caractère, le prix est recalculé à chaque modification.',
                },
                {
                  q: 'Que se passe-t-il après le paiement ?',
                  r: 'Un formaliste vérifie la cohérence de l’annonce avec vos informations, la transmet au journal habilité, puis vous envoie l’attestation de parution par e-mail.',
                },
              ]}
            />
          </article>

          <aside className="colle">
            <div className="carte carte-ombre">
              <p className="surtitre">Tarif {ANNEE_TARIFS}</p>
              <div className="prix-grand">{forfait ? euros(forfait.france) : 'Au caractère'}</div>
              <p className="muted petit">{forfait ? 'HT, forfait réglementé (hors 974 et 976)' : 'Prix calculé en direct selon la longueur et le département'}</p>
              <Link href={`/tunnel?type=${t.slug}`} className="btn btn-primaire btn-bloc">
                Publier cette annonce
              </Link>
              <ul className="puces-confiance" style={{ flexDirection: 'column', gap: 6 }}>
                <li>Journal habilité du département</li>
                <li>Relecture par un formaliste</li>
                <li>Attestation incluse</li>
              </ul>
            </div>
            {formalite && (
              <div className="carte" style={{ marginTop: 16 }}>
                <strong>Besoin de la formalité complète ?</strong>
                <p className="petit muted" style={{ margin: '6px 0 10px' }}>
                  Nous publions l’annonce et déposons le dossier au guichet unique.
                </p>
                <Link href={`/formalites/${formalite.categorie}/${formalite.slug}`}>{formalite.titre} →</Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      {voisins.length > 0 && (
        <section className="section section-alt">
          <div className="conteneur">
            <h2>Autres annonces : {c.titre.toLowerCase()}</h2>
            <div className="grille grille-3" style={{ marginTop: 20 }}>
              {voisins.map((v) => (
                <Link key={v.slug} href={`/annonces-legales/${v.categorie}/${v.slug}`} className="carte carte-lien">
                  <strong>{v.titre}</strong>
                  <span className="petit muted">{v.resume}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <BandeauCta />
    </>
  )
}
