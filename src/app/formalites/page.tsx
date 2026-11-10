import type { Metadata } from 'next'
import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { EnTetePage } from '@/components/EnTetePage'
import { Faq } from '@/components/Faq'
import { CATEGORIES_FORMALITES, ETAPES_FORMALITE, FORMALITES, JETONS_BROUILLON, JETONS_PAR_ANNONCE, forfaitAnnonce, prixBrouillon } from '@/data/formalites'
import { SLOGANS } from '@/data/site'
import { euros } from '@/lib/prix'

export const metadata: Metadata = {
  title: 'Guichet unique de l’INPI : votre formalité pré-remplie',
  description:
    'Création, modification, cessation : déposez vos pièces, un brouillon pré-rempli est créé sur votre compte du guichet unique de l’INPI. Vous relisez et signez.',
  alternates: { canonical: '/formalites' },
}

export default function GuichetUnique() {
  return (
    <>
      <EnTetePage
        ariane={[{ nom: 'Guichet unique' }]}
        surtitre="Guichet unique de l’INPI"
        titre={
          <>
            Le guichet unique, <em>sans la file d’attente</em>.
          </>
        }
        chapo="Création, modification, cessation : déposez vos pièces, le brouillon de votre formalité se crée sur votre compte INPI. Il ne vous reste qu’à le relire et à le signer."
        refs={['Guichet unique obligatoire depuis le 1er janvier 2023', 'Loi PACTE du 22 mai 2019, art. 1er']}
      >
        <Link href="/connexion" className="btn btn-primaire">
          Commencer une formalité
        </Link>
        <Link href="/formalites/tarifs" className="btn btn-secondaire">
          Prix en jetons
        </Link>
      </EnTetePage>

      <section className="section">
        <div className="conteneur">
          <p className="surtitre">Comment ça marche</p>
          <h2>
            Quatre étapes. <em>Une seule vous demande du temps.</em>
          </h2>
          <ol className="etapes" style={{ marginTop: 28 }}>
            {ETAPES_FORMALITE.map((e) => (
              <li key={e.titre}>
                <strong>{e.titre}</strong>
                <span className="muted">{e.texte}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur duo">
          <div>
            <p className="surtitre">Moins de saisie, sans perdre la main</p>
            <h2>
              La machine remplit. <em>Vous décidez.</em>
            </h2>
            <ul className="liste-coches">
              <li>Vos pièces sont lues par une intelligence artificielle, qui remplit le dossier à votre place</li>
              <li>Rien n’est déposé sans vous : vous relisez, corrigez si besoin et signez sur le site de l’INPI</li>
              <li>Vos identifiants INPI sont conservés chiffrés, vos pièces supprimées 30 jours après leur envoi</li>
              <li>Les frais officiels se règlent à l’INPI, au moment de signer</li>
            </ul>
          </div>
          <div className="carte carte-ombre">
            <p className="surtitre">Exemple · Création de société</p>
            <table>
              <tbody>
                <tr>
                  <td>Statuts signés</td>
                  <td className="montant muted">PDF</td>
                </tr>
                <tr>
                  <td>Pièce d’identité du dirigeant</td>
                  <td className="montant muted">PDF</td>
                </tr>
                <tr>
                  <td>Justificatif du siège</td>
                  <td className="montant muted">PDF</td>
                </tr>
                <tr>
                  <td>
                    <strong>Brouillon créé sur votre compte INPI</strong>
                    <br />
                    <span className="petit muted">À relire et à signer sur le site de l’INPI</span>
                  </td>
                  <td className="montant montant-fort">Prêt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" id="catalogue">
        <div className="conteneur">
          <p className="surtitre">Vos formalités</p>
          <h2>De la création à la clôture</h2>
          {CATEGORIES_FORMALITES.map((c) => (
            <div key={c.slug} id={c.slug} style={{ marginTop: 40, scrollMarginTop: 96 }}>
              <h3>{c.titre}</h3>
              <p className="muted">{c.description}</p>
              <div className="grille grille-3">
                {FORMALITES.filter((f) => f.categorie === c.slug).map((f) => {
                  const annonce = forfaitAnnonce(f)
                  return (
                    <Link key={f.slug} href={`/formalites/${f.categorie}/${f.slug}`} className="carte carte-lien">
                      <strong>{f.titre}</strong>
                      <span className="petit muted">{f.resume}</span>
                      <span className="prix">
                        {annonce !== null ? `Annonce ${euros(annonce)} HT · ` : ''}
                        {JETONS_BROUILLON[f.categorie] ? `brouillon ${prixBrouillon(f)}` : 'brouillon INPI'}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur section-etroite">
          <p className="surtitre">Questions fréquentes</p>
          <h2>Le compte INPI, le brouillon, vos pièces</h2>
          <Faq
            questions={[
              {
                q: 'Faut-il un compte au guichet unique de l’INPI ?',
                r: 'Oui : le brouillon est créé sur votre compte INPI, ou sur celui de votre cabinet. Si vous n’en avez pas, vous le créez gratuitement sur le site de l’INPI avant de commencer.',
              },
              {
                q: 'Le dossier est-il déposé automatiquement ?',
                r: 'Non. Nous préparons le brouillon ; c’est vous qui le relisez, le signez et le déposez sur le site de l’INPI. Vous gardez la main jusqu’au bout.',
              },
              {
                q: 'Combien coûte un brouillon ?',
                r: `Il se règle en jetons : ${JETONS_BROUILLON.creation} pour une création, ${JETONS_BROUILLON.modification} pour une modification. Les jetons ne s’achètent pas : chaque annonce légale publiée en rapporte ${JETONS_PAR_ANNONCE}. Les frais officiels de la formalité se paient à l’INPI.`,
              },
              {
                q: 'Que deviennent mes identifiants INPI ?',
                r: 'Ils sont enregistrés chiffrés, ne sont jamais réaffichés et ne servent qu’à créer vos brouillons. Vous pouvez les supprimer à tout moment.',
              },
              {
                q: 'Que deviennent mes pièces ?',
                r: 'Elles sont conservées sur un espace privé, puis supprimées automatiquement 30 jours après leur envoi.',
              },
            ]}
          />
        </div>
      </section>

      <BandeauCta titre={SLOGANS.guichet} texte="Déposez vos pièces, relisez le brouillon, signez à l’INPI. Le reste est déjà fait." />
    </>
  )
}
