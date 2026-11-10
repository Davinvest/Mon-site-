import type { Metadata } from 'next'
import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { EnTetePage } from '@/components/EnTetePage'
import { CATEGORIES_FORMALITES, FORMALITES, JETONS_BROUILLON, JETONS_PAR_ANNONCE, forfaitAnnonce, prixBrouillon } from '@/data/formalites'
import { euros } from '@/lib/prix'

export const metadata: Metadata = {
  title: 'Guichet unique : le prix du brouillon, en jetons',
  description: 'Un brouillon de formalité se règle en jetons, et chaque annonce légale publiée en rapporte. Les frais officiels se paient à l’INPI.',
  alternates: { canonical: '/formalites/tarifs' },
}

export default function TarifsGuichet() {
  return (
    <>
      <EnTetePage
        ariane={[{ nom: 'Guichet unique', href: '/formalites' }, { nom: 'Prix' }]}
        surtitre="Guichet unique · Prix"
        titre={
          <>
            Vos annonces <em>financent</em> vos formalités.
          </>
        }
        chapo={`Le brouillon INPI se règle en jetons. Les jetons ne s’achètent pas : chaque annonce légale publiée en rapporte ${JETONS_PAR_ANNONCE} au portefeuille de votre cabinet.`}
      />

      <section className="section">
        <div className="conteneur">
          <div className="grille grille-3">
            <div className="carte">
              <p className="surtitre">Vous gagnez</p>
              <div className="prix-grand">+ {JETONS_PAR_ANNONCE}</div>
              <p className="muted" style={{ margin: 0 }}>jetons par annonce légale publiée</p>
            </div>
            <div className="carte">
              <p className="surtitre">Brouillon de création</p>
              <div className="prix-grand">{JETONS_BROUILLON.creation}</div>
              <p className="muted" style={{ margin: 0 }}>jetons pour une immatriculation</p>
            </div>
            <div className="carte">
              <p className="surtitre">Brouillon de modification</p>
              <div className="prix-grand">{JETONS_BROUILLON.modification}</div>
              <p className="muted" style={{ margin: 0 }}>jetons pour une modification</p>
            </div>
          </div>
          <p className="muted petit" style={{ marginTop: 16 }}>
            Les jetons sont débités du portefeuille du cabinet, et rendus si le brouillon n’est pas créé. Les frais officiels de la
            formalité ne sont pas compris : vous les réglez à l’INPI au moment de signer.
          </p>

          {CATEGORIES_FORMALITES.map((c) => (
            <div key={c.slug} style={{ marginTop: 44 }}>
              <h2>{c.titre}</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Formalité</th>
                      <th className="montant">Annonce légale (tarif officiel HT)</th>
                      <th className="montant">Brouillon INPI</th>
                      <th className="montant">
                        <span className="sr-only">Détail</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FORMALITES.filter((f) => f.categorie === c.slug).map((f) => {
                      const annonce = forfaitAnnonce(f)
                      return (
                        <tr key={f.slug}>
                          <td>{f.titre}</td>
                          <td className="montant">{f.annonce ? (annonce !== null ? euros(annonce) : 'au caractère') : '—'}</td>
                          <td className="montant montant-fort">{prixBrouillon(f)}</td>
                          <td className="montant">
                            <Link href={`/formalites/${f.categorie}/${f.slug}`}>Détail</Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="muted petit" style={{ marginTop: 16 }}>
            Tarifs des annonces : arrêté en vigueur, hors La Réunion et Mayotte. Voir la{' '}
            <Link href="/annonces-legales/tarifs">grille complète des annonces légales</Link>.
          </p>
        </div>
      </section>

      <BandeauCta titre="Publiez une annonce, gagnez vos premiers jetons." texte={`Chaque annonce publiée crédite ${JETONS_PAR_ANNONCE} jetons : de quoi régler le brouillon de votre prochaine formalité.`} />
    </>
  )
}
