import type { Metadata } from 'next'
import Link from 'next/link'
import { Attestation } from '@/components/Attestation'
import { Chrono } from '@/components/Chrono'
import { CoupureJournal } from '@/components/CoupureJournal'
import { EnTetePage, Refs } from '@/components/EnTetePage'
import { REFERENCES, SITE, SLOGANS } from '@/data/site'

export const metadata: Metadata = {
  title: 'Charte graphique et éditoriale',
  robots: { index: false },
}

const COULEURS = [
  ['Fond ivoire', '#FBF8F1', 'Fond de toutes les pages'],
  ['Ivoire foncé', '#F4EFE3', 'Sections alternées, encadrés'],
  ['Papier', '#FFFDF8', 'Coupure de journal, attestation'],
  ['Encre', '#14203F', 'Texte courant, titres'],
  ['Encre douce', '#55607A', 'Textes secondaires'],
  ['Bleu France', '#1D3F8F', 'Boutons, mot fort des titres, prix'],
  ['Bleu nuit', '#0F1B3D', 'Pied de page, bandeau final, chronomètre'],
  ['Rouge', '#C8102E', 'Soulignements, surtitres, repères'],
  ['Filet', '#E5DDCB', 'Bordures des cartes'],
] as const

const SLOGANS_PAR_PAGE: [string, string][] = [
  ['Accueil', SLOGANS.accueil],
  ['Signature (pied de page)', SITE.signature],
  ['Annonces légales', SLOGANS.annonces],
  ['Fiche d’un type d’annonce', `Constitution de SAS : ${SLOGANS.fiche}`],
  ['Tarifs', SLOGANS.tarifs],
  ['Parcours de commande', SLOGANS.publier],
  ['Guichet unique', SLOGANS.guichet],
  ['Cabinets', SLOGANS.cabinets],
  ['Guides', SLOGANS.guides],
  ['Qui sommes-nous', SLOGANS.apropos],
  ['Contact', SLOGANS.contact],
  ['Confirmation de commande', SLOGANS.confirmation],
  ['Bandeau de fin de page', SLOGANS.fin],
]

export default function Charte() {
  return (
    <>
      <EnTetePage
        ariane={[{ nom: 'Charte' }]}
        surtitre="Pour le développeur"
        titre={
          <>
            La charte <em>Comptoir Légal</em>
          </>
        }
        chapo="Les couleurs, les polices, les composants et les slogans de la maquette, avec les règles à respecter. Le code source complet est sur GitHub (Davinvest/Mon-site-)."
      >
        <a href="#couleurs" className="btn btn-secondaire">
          Couleurs
        </a>
        <a href="#composants" className="btn btn-secondaire">
          Composants
        </a>
        <a href="#slogans" className="btn btn-secondaire">
          Slogans
        </a>
        <a href="#regles" className="btn btn-secondaire">
          Règles
        </a>
      </EnTetePage>

      <section className="section" id="couleurs">
        <div className="conteneur">
          <p className="surtitre">01 · Couleurs</p>
          <h2>Le papier officiel, le bleu-blanc-rouge en repères</h2>
          <p className="muted">
            Le fond ivoire évoque le papier à en-tête et le journal d’annonces légales. Le bleu France porte l’action, le rouge ne sert
            qu’à souligner. Le liseré tricolore court sous le menu et au-dessus du pied de page.
          </p>
          <div className="nuancier" style={{ marginTop: 20 }}>
            {COULEURS.map(([nom, code, usage]) => (
              <div key={code} className="nuance">
                <div className="nuance-couleur" style={{ background: code }} />
                <div className="nuance-texte">
                  <strong>{nom}</strong>
                  <code>{code}</code>
                  <span className="muted">{usage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur duo duo-haut">
          <div>
            <p className="surtitre">02 · Polices</p>
            <h2>Une serif pour l’autorité, une linéale pour la clarté</h2>
            <p className="muted">
              Les deux polices sont libres (licence SIL Open Font) et embarquées dans le site, sans appel à Google : paquets npm{' '}
              <code>@fontsource-variable/source-serif-4</code> et <code>@fontsource-variable/inter</code>.
            </p>
          </div>
          <div className="carte">
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 650, lineHeight: 1.15, margin: '0 0 6px' }}>
              Source Serif 4
            </p>
            <p className="muted petit">Titres, slogans, coupure de journal, chiffres de prix.</p>
            <p style={{ fontSize: '1.3rem', fontWeight: 600, margin: '18px 0 6px' }}>Inter</p>
            <p className="muted petit" style={{ margin: 0 }}>
              Texte courant, menus, boutons, formulaires, tableaux.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="composants">
        <div className="conteneur">
          <p className="surtitre">03 · Composants</p>
          <h2>Les pièces qui font l’ambiance</h2>

          <h3 style={{ marginTop: 32 }}>Titres : le mot fort en bleu, souligné de rouge</h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 650, margin: 0 }}>
            Le tarif de l’État.{' '}
            <em style={{ fontStyle: 'normal', color: 'var(--brand)', textDecoration: 'underline', textDecorationColor: 'var(--accent)' }}>
              Pas un euro de plus.
            </em>
          </p>

          <h3 style={{ marginTop: 32 }}>Boutons et étiquettes</h3>
          <div className="actions" style={{ marginTop: 8 }}>
            <span className="btn btn-primaire">Publier mon annonce</span>
            <span className="btn btn-secondaire">Voir les tarifs</span>
            <span className="badge">Sans compte</span>
            <span className="badge badge-accent">Avec votre compte INPI</span>
          </div>
          <Refs refs={[REFERENCES.loi1955, REFERENCES.arrete, REFERENCES.codeCommerce]} />

          <div className="grille grille-2" style={{ marginTop: 40, alignItems: 'start' }}>
            <div>
              <h3>Le chronomètre de démonstration</h3>
              <p className="muted petit">En haut de l’accueil. Il boucle, et porte toujours la mention « démonstration ».</p>
              <Chrono />
            </div>
            <div>
              <h3>La coupure de journal</h3>
              <p className="muted petit">Aperçu de l’annonce dans le parcours de commande et sur chaque fiche.</p>
              <CoupureJournal
                titre="Avis de constitution"
                lieu="Rhône (69)"
                texte="Aux termes d’un acte sous seing privé en date du 2 mars 2026, il a été constitué une société présentant les caractéristiques suivantes : Forme : SAS. Dénomination : ATELIER MÉRIDIEN. Siège social : 12 rue des Tanneurs, 69002 Lyon…"
              />
              <h3 style={{ marginTop: 32 }}>L’attestation de parution (spécimen)</h3>
              <Attestation />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="slogans">
        <div className="conteneur">
          <p className="surtitre">04 · Slogans</p>
          <h2>Une phrase forte par page</h2>
          <div className="table-scroll" style={{ marginTop: 20 }}>
            <table>
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Slogan (titre principal)</th>
                </tr>
              </thead>
              <tbody>
                {SLOGANS_PAR_PAGE.map(([page, slogan]) => (
                  <tr key={page}>
                    <td>{page}</td>
                    <td style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>{slogan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" id="regles">
        <div className="conteneur duo duo-haut">
          <div>
            <p className="surtitre">05 · Règles</p>
            <h2>Ce qu’on fait, ce qu’on ne fait jamais</h2>
            <ul className="liste-coches">
              <li>Les prix officiels de l’arrêté, affichés partout, avant le paiement</li>
              <li>Une annonce peut se publier sans créer de compte</li>
              <li>Des références de textes exactes quand on cite la loi</li>
              <li>Les chiffres de rapidité seulement s’ils sont mesurés et vrais</li>
            </ul>
          </div>
          <div>
            <ul className="liste-coches liste-croix" style={{ marginTop: 52 }}>
              <li>Pas de Marianne, de logo de la République ni d’imitation d’un site de l’État</li>
              <li>Pas de superlatifs invérifiables (« le plus rapide », « n°1 », « nulle part ailleurs »)</li>
              <li>Pas de badge « % remise » sur les pages publiques : la remise vit dans l’espace client</li>
              <li>Pas d’avis clients ni de statistiques inventés</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur section-etroite">
          <p className="surtitre">06 · Ce qui est illustratif</p>
          <h2>À remplacer par le réel</h2>
          <ul className="liste-coches">
            <li>Les durées du chronomètre : à remplacer par les délais réels du moteur de publication</li>
            <li>L’attestation et les exemples d’annonces : données fictives (SAS Atelier Méridien)</li>
            <li>La page « Se connecter » : maquette, la vraie connexion existe déjà sur le site de production</li>
            <li>Le paiement : en démonstration, aucune somme n’est encaissée</li>
            <li>Les mentions légales et les CGV : coordonnées de la société à compléter</li>
          </ul>
          <p style={{ marginTop: 24 }}>
            <Link href="/">← Retour à la maquette</Link>
          </p>
        </div>
      </section>
    </>
  )
}
