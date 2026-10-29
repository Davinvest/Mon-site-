import type { Metadata } from 'next'
import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { Faq } from '@/components/Faq'
import { FilAriane } from '@/components/FilAriane'
import { TYPES_ANNONCE } from '@/data/annonces'
import { ANNEE_TARIFS, DESCRIPTION_ANNEXES, FORFAITS, REFERENCE_ARRETE, TARIF_CARACTERE, TAUX_TVA } from '@/data/tarifs-annonces'
import type { Annexe, CleForfait } from '@/data/tarifs-annonces'
import { euros } from '@/lib/prix'

export const metadata: Metadata = {
  title: `Tarifs des annonces légales ${ANNEE_TARIFS} : forfaits et prix au caractère`,
  description: `Grille officielle ${ANNEE_TARIFS} des annonces légales : forfaits par formalité, tarifs de La Réunion et Mayotte, prix au caractère par département.`,
  alternates: { canonical: '/annonces-legales/tarifs' },
}

const GROUPES: { titre: string; cles: CleForfait[] }[] = [
  {
    titre: 'Constitution de société',
    cles: ['constitution-sa', 'constitution-sas', 'constitution-sasu', 'constitution-snc', 'constitution-sarl', 'constitution-eurl', 'constitution-societe-civile', 'constitution-sci'],
  },
  {
    titre: 'Modifications',
    cles: ['transfert-siege', 'dirigeants', 'commissaire-aux-comptes', 'administrateur', 'prorogation-duree', 'objet-social', 'capital-social', 'transformation', 'denomination', 'cession-parts', 'poursuite-activite-pertes', 'nom-patronymique'],
  },
  { titre: 'Dissolution et liquidation', cles: ['dissolution', 'cloture-liquidation'] },
]

const ttc = (ht: number) => Math.round(ht * (1 + TAUX_TVA) * 100) / 100

function lienPublier(cle: CleForfait) {
  const t = TYPES_ANNONCE.find((x) => x.forfait === cle)
  return t ? `/tunnel?type=${t.slug}` : '/tunnel'
}

export default function Tarifs() {
  const auCaractere = TYPES_ANNONCE.filter((t) => !t.forfait)
  return (
    <>
      <section className="heros" style={{ paddingBottom: 24 }}>
        <div className="conteneur">
          <FilAriane elements={[{ nom: 'Annonces légales', href: '/annonces-legales' }, { nom: `Tarifs ${ANNEE_TARIFS}` }]} />
          <span className="surtitre">{REFERENCE_ARRETE}</span>
          <h1>Tarifs des annonces légales en {ANNEE_TARIFS}</h1>
          <p className="chapo">
            Le prix d’une annonce légale ne dépend pas du journal : il est fixé chaque année par arrêté ministériel. Forfait pour les
            formalités courantes, prix au caractère pour les autres. Tous les montants sont hors taxes (TVA {TAUX_TVA * 100} %).
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }}>
        <div className="conteneur">
          {GROUPES.map((g) => (
            <div key={g.titre} style={{ marginBottom: 40 }}>
              <h2>{g.titre}</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Formalité</th>
                      <th className="montant">France (HT)</th>
                      <th className="montant">France (TTC)</th>
                      <th className="montant">Réunion, Mayotte (HT)</th>
                      <th className="montant">
                        <span className="sr-only">Publier</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.cles.map((cle) => (
                      <tr key={cle}>
                        <td>{FORFAITS[cle].libelle}</td>
                        <td className="montant">{euros(FORFAITS[cle].france)}</td>
                        <td className="montant">{euros(ttc(FORFAITS[cle].france))}</td>
                        <td className="montant">{euros(FORFAITS[cle].reunionMayotte)}</td>
                        <td className="montant">
                          <Link href={lienPublier(cle)}>Publier</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="muted petit">
            Les sociétés d’exercice libéral suivent le forfait de leur forme commerciale équivalente : SELARL comme la SARL, SELAS comme la
            SAS, SELAFA comme la SA. Les sociétés en commandite (SCS, SCA, SELCA) sont tarifées au caractère.
          </p>

          <h2 style={{ marginTop: 48 }}>Tarif au caractère, par département</h2>
          <p className="muted">
            Pour les annonces sans forfait, le prix est égal au nombre de caractères (espaces comprises) multiplié par le tarif du
            département de publication. Exemple : 400 caractères dans l’Ain = 400 × 0,189 € = 75,60 € HT.
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Annexe</th>
                  <th>Départements</th>
                  <th className="montant">Prix HT / caractère</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(TARIF_CARACTERE) as Annexe[]).map((a) => (
                  <tr key={a}>
                    <td>{a}</td>
                    <td>{DESCRIPTION_ANNEXES[a]}</td>
                    <td className="montant">{TARIF_CARACTERE[a].toLocaleString('fr-FR', { minimumFractionDigits: 3 })} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted petit" style={{ marginTop: 12 }}>
            Annonces facturées au caractère : {auCaractere.map((t) => t.titre).join(', ')}, ainsi que toute annonce regroupant plusieurs
            modifications.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur" style={{ maxWidth: 860 }}>
          <h2>Payer le juste prix</h2>
          <Faq
            questions={[
              {
                q: 'Pourquoi certains sites affichent-ils des prix plus élevés ?',
                r: 'Le tarif de l’annonce est le même partout, mais certains prestataires ajoutent des frais de dossier, d’envoi de l’attestation ou des options « urgence ». Chez Comptoir Légal, vous payez le tarif réglementé, sans supplément.',
              },
              {
                q: 'Comment réduire le prix d’une annonce au caractère ?',
                r: 'En gardant uniquement les mentions obligatoires et les abréviations admises (RCS, SARL, cap.). L’aperçu du tunnel compte les caractères en direct.',
              },
              {
                q: 'L’attestation de parution est-elle payante ?',
                r: 'Non, elle est incluse dans le prix de l’annonce.',
              },
            ]}
          />
        </div>
      </section>

      <BandeauCta />
    </>
  )
}
