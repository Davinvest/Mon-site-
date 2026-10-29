import type { Metadata } from 'next'
import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { FilAriane } from '@/components/FilAriane'
import { CATEGORIES_FORMALITES, FORMALITES } from '@/data/formalites'
import { euros } from '@/lib/prix'

export const metadata: Metadata = {
  title: 'Honoraires des formalités d’entreprise',
  description: 'Honoraires forfaitaires Comptoir Légal pour la création, la modification et la cessation de société, hors frais officiels.',
  alternates: { canonical: '/formalites/tarifs' },
}

export default function TarifsFormalites() {
  return (
    <>
      <section className="heros" style={{ paddingBottom: 24 }}>
        <div className="conteneur">
          <FilAriane elements={[{ nom: 'Formalités', href: '/formalites' }, { nom: 'Honoraires' }]} />
          <h1>Nos honoraires</h1>
          <p className="chapo">
            Un forfait par formalité, annoncé avant de commencer. Les frais officiels (greffe, INPI) et l’annonce légale s’ajoutent à
            leur tarif réglementé, sans marge, et figurent sur le devis.
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
                      <th className="montant">Honoraires HT</th>
                      <th className="montant">Honoraires TTC</th>
                      <th className="montant">
                        <span className="sr-only">Détail</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FORMALITES.filter((f) => f.categorie === c.slug).map((f) => (
                      <tr key={f.slug}>
                        <td>{f.titre}</td>
                        <td className="montant">{euros(f.honoraires)}</td>
                        <td className="montant">{euros(Math.round(f.honoraires * 120) / 100)}</td>
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
            Les honoraires couvrent la vérification, le dépôt et le suivi du dossier. Ne sont pas compris : la rédaction des statuts ou des
            procès-verbaux (sur devis), les frais de greffe et d’INPI, l’annonce légale.
          </p>
        </div>
      </section>
      <BandeauCta titre="Un devis pour votre formalité" texte="Décrivez votre projet, nous revenons vers vous sous 24 h ouvrées avec un devis détaillé." />
    </>
  )
}
