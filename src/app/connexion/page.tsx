import type { Metadata } from 'next'
import Link from 'next/link'
import { JETONS_PAR_ANNONCE } from '@/data/formalites'

export const metadata: Metadata = {
  title: 'Se connecter',
  robots: { index: false },
}

/**
 * Maquette de l'écran de connexion : elle montre la mise en page attendue.
 * La connexion réelle (comptes, cabinets, portefeuille) existe sur le site de production.
 */
export default function Connexion() {
  return (
    <section className="entete-page" style={{ borderBottom: 0 }}>
      <div className="conteneur duo duo-haut">
        <div>
          <p className="surtitre">Espace client</p>
          <h1>
            Vos annonces, vos formalités, <em>votre cabinet</em>.
          </h1>
          <p className="chapo">Retrouvez vos attestations de parution, le suivi de vos commandes et le portefeuille de votre cabinet.</p>
          <ul className="liste-coches">
            <li>Toutes vos attestations, rangées par commande</li>
            <li>Vos collègues et vos cabinets au même endroit</li>
            <li>{JETONS_PAR_ANNONCE} jetons crédités à chaque annonce publiée</li>
          </ul>
          <div className="encadre">
            Pas besoin de compte pour publier une annonce. <Link href="/tunnel">Publier sans compte →</Link>
          </div>
        </div>

        <div className="carte carte-ombre">
          <p className="alerte alerte-info" style={{ marginTop: 0 }}>
            Maquette : cet écran montre la mise en page attendue, il ne connecte à aucun compte.
          </p>
          <form aria-label="Connexion (maquette)">
            <div className="champ">
              <label htmlFor="cx-email">Adresse e-mail</label>
              <input id="cx-email" type="email" autoComplete="off" placeholder="vous@cabinet.fr" disabled />
            </div>
            <div className="champ">
              <label htmlFor="cx-mdp">Mot de passe</label>
              <input id="cx-mdp" type="password" autoComplete="off" disabled />
            </div>
            <button type="button" className="btn btn-primaire btn-bloc" disabled>
              Se connecter
            </button>
            <p className="petit muted" style={{ margin: '14px 0 0', textAlign: 'center' }}>
              Mot de passe oublié · Créer un compte
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
