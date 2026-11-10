import type { Metadata } from 'next'
import Link from 'next/link'
import { EnTetePage } from '@/components/EnTetePage'
import { FormulaireContact } from '@/components/FormulaireContact'
import { JETONS_PAR_ANNONCE } from '@/data/formalites'

export const metadata: Metadata = {
  title: 'Cabinets : annonces légales et formalités de vos clients',
  description:
    'Experts-comptables, avocats, formalistes : un seul espace pour les annonces légales et les formalités de vos clients, avec votre équipe et vos cabinets.',
  alternates: { canonical: '/professionnels' },
}

const atouts = [
  ['Plusieurs cabinets', 'Un seul cabinet ? Rien à choisir. Plusieurs ? Vous indiquez le cabinet au moment de commander, et chacun garde ses commandes.'],
  ['Vos collègues', 'Invitez-les dans un cabinet : ils commandent avec vous, et chacun voit où en est chaque dossier.'],
  ['Le lien de paiement', 'Votre client règle lui-même. Vous lui envoyez un lien, l’annonce part dès qu’il a payé.'],
  ['Le portefeuille', `Chaque annonce publiée crédite ${JETONS_PAR_ANNONCE} jetons. Ils règlent vos brouillons au guichet unique.`],
  ['La remise du cabinet', 'Les conditions de votre cabinet s’appliquent à chaque commande, et le prix final s’affiche avant le paiement.'],
  ['Tout au même endroit', 'Commandes, attestations de parution, pièces des formalités : réunies sur chaque dossier, retrouvées en un instant.'],
]

export default function Cabinets() {
  return (
    <>
      <EnTetePage
        ariane={[{ nom: 'Cabinets' }]}
        surtitre="Experts-comptables · Avocats · Formalistes"
        titre={
          <>
            Vos dossiers avancent. <em>Vous, vous conseillez.</em>
          </>
        }
        chapo="Un seul espace pour les annonces légales et les formalités de tous vos clients, avec votre équipe, vos cabinets et un portefeuille qui se remplit à chaque publication."
      >
        <Link href="/connexion" className="btn btn-primaire">
          Créer l’espace de mon cabinet
        </Link>
        <a href="#demonstration" className="btn btn-secondaire">
          Demander une démonstration
        </a>
      </EnTetePage>

      <section className="section">
        <div className="conteneur">
          <p className="surtitre">Pensé pour le travail en cabinet</p>
          <h2>
            Six raisons de <em>ne plus ressaisir</em>
          </h2>
          <div className="grille grille-3" style={{ marginTop: 28 }}>
            {atouts.map(([titre, texte]) => (
              <div key={titre} className="carte">
                <h3>{titre}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {texte}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur">
          <p className="surtitre">Une annonce pour votre client</p>
          <h2>Trois gestes, et le dossier est à jour.</h2>
          <ol className="etapes" style={{ marginTop: 28 }}>
            <li>
              <strong>Vous rédigez</strong>
              <span className="muted">Le formulaire du type d’acte écrit l’avis, avec ses mentions obligatoires.</span>
            </li>
            <li>
              <strong>Votre client paie</strong>
              <span className="muted">Par carte, avec le portefeuille du cabinet ou par un lien que vous lui envoyez.</span>
            </li>
            <li>
              <strong>L’attestation arrive</strong>
              <span className="muted">Elle est rangée dans le dossier, prête à joindre à la formalité.</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="section" id="demonstration" style={{ scrollMarginTop: 90 }}>
        <div className="conteneur duo duo-haut">
          <div>
            <p className="surtitre">Parlons de votre cabinet</p>
            <h2>Une démonstration vaut mieux qu’une brochure.</h2>
            <p className="muted">
              Dites-nous combien d’annonces et de formalités vous traitez : nous vous montrons le parcours sur un de vos cas, et nous
              réglons avec vous les conditions de votre cabinet.
            </p>
            <div className="encadre">
              <strong>Éditeur de logiciel ?</strong> Une API est en préparation, pour publier une annonce depuis votre outil. Écrivez-nous
              pour en parler.
            </div>
          </div>
          <div className="carte carte-ombre">
            <FormulaireContact sujet="Cabinets et démonstration" origine="/professionnels" libelleBouton="Envoyer ma demande" />
          </div>
        </div>
      </section>
    </>
  )
}
