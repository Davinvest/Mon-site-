import type { Metadata } from 'next'
import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { FilAriane } from '@/components/FilAriane'
import { CATEGORIES_FORMALITES, FORMALITES, forfaitAnnonce, prixAccompagnement } from '@/data/formalites'
import { euros } from '@/lib/prix'

export const metadata: Metadata = {
  title: 'Tarifs des formalités d’entreprise',
  description: 'Prix officiels des annonces légales liées à chaque formalité de société, et accompagnement sur devis.',
  alternates: { canonical: '/formalites/tarifs' },
}

export default function TarifsFormalites() {
  return (
    <>
      <section className="heros" style={{ paddingBottom: 24 }}>
        <div className="conteneur">
          <FilAriane elements={[{ nom: 'Formalités', href: '/formalites' }, { nom: 'Tarifs' }]} />
          <h1>Tarifs des formalités</h1>
          <p className="chapo">
            L’annonce légale et les frais de greffe sont des tarifs officiels, les mêmes partout en France. L’accompagnement par un
            formaliste fait l’objet d’un devis gratuit, envoyé avant tout engagement.
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 16 }}>
        <div className="conteneur">
          {CATEGORIES_FORMALITES.map((c) => (
            <div key={c.slug} style={{ marginBottom: 40 }}>
              <h2>{c.titre}</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Formalité</th>
                      <th className="montant">Annonce légale (tarif officiel HT)</th>
                      <th className="montant">Accompagnement</th>
                      <th className="montant">
                        <span className="sr-only">Détail</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FORMALITES.filter((f) => f.categorie === c.slug).map((f) => (
                      <tr key={f.slug}>
                        <td>{f.titre}</td>
                        <td className="montant">{f.annonce ? (forfaitAnnonce(f) !== null ? euros(forfaitAnnonce(f) as number) : 'au caractère') : '—'}</td>
                        <td className="montant">{prixAccompagnement(f)}</td>
                        <td className="montant">
                          <Link href={`/formalites/${f.categorie}/${f.slug}`}>Détail</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="muted petit">
            Tarifs des annonces : arrêté en vigueur, hors La Réunion et Mayotte (voir la grille complète des annonces légales). Les frais
            de greffe et d’INPI s’ajoutent à leur tarif réglementé et figurent sur le devis.
          </p>
        </div>
      </section>
      <BandeauCta titre="Un devis pour votre formalité" texte="Décrivez votre projet, nous revenons vers vous sous 24 h ouvrées avec un devis détaillé." />
    </>
  )
}
